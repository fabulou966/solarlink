import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

async function execStatement(stmt) {
  if (!stmt.trim() || stmt.trim().startsWith('--')) return;
  
  try {
    // Use PostgREST to execute raw SQL via a workaround
    // We'll use the pg_query function if available, or try direct
    const { error } = await db.rpc('pg_query', { query: stmt });
    if (error) {
      // Try alternative
      console.log(`  ⚠️  ${stmt.substring(0, 80)}...`);
      return false;
    }
    console.log(`  ✓ ${stmt.substring(0, 80)}...`);
    return true;
  } catch (e) {
    console.log(`  ⚠️  ${stmt.substring(0, 80)}... (${e.message})`);
    return false;
  }
}

async function runSQL(file, label) {
  const sql = readFileSync(file, 'utf8');
  console.log(`\n=== Running ${label} ===`);
  
  // Parse statements more carefully - handle dollar-quoted strings
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = sql[i + 1] || '';
    
    if (!inDollarQuote && char === '$' && next === '$') {
      inDollarQuote = true;
      dollarTag = '$$';
      current += '$$';
      i++;
    } else if (!inDollarQuote && char === '$' && /[a-zA-Z_]/.test(next)) {
      // Named dollar quote like $tag$
      let tag = '$';
      let j = i + 1;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) {
        tag += sql[j];
        j++;
      }
      if (j < sql.length && sql[j] === '$') {
        tag += '$';
        inDollarQuote = true;
        dollarTag = tag;
        current += tag;
        i = j;
      } else {
        current += char;
      }
    } else if (inDollarQuote && sql.substring(i, i + dollarTag.length) === dollarTag) {
      inDollarQuote = false;
      current += dollarTag;
      i += dollarTag.length - 1;
    } else if (!inDollarQuote && char === ';') {
      statements.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) statements.push(current.trim());
  
  for (const stmt of statements) {
    if (!stmt) continue;
    await execStatement(stmt);
  }
  console.log(`=== ${label} done ===\n`);
}

await runSQL('/workspace/app/supabase/step3.sql', 'step3.sql');
await runSQL('/workspace/app/supabase/step4-boq.sql', 'step4-boq.sql');
