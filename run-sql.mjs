import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key);

async function runSQL(file, label) {
  const sql = readFileSync(file, 'utf8');
  console.log(`Running ${label}...`);
  
  // Split by semicolon and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  for (const stmt of statements) {
    if (!stmt) continue;
    try {
      // Use the REST API to execute raw SQL
      const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ sql: stmt + ';' }),
      });
      
      if (!response.ok) {
        const err = await response.text();
        console.log(`  ⚠️  ${stmt.substring(0, 80)}...`);
        console.log(`     ${err.substring(0, 200)}`);
      } else {
        console.log(`  ✓ ${stmt.substring(0, 60)}...`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
  console.log(`${label} done\n`);
}

await runSQL('/workspace/app/supabase/step3.sql', 'step3.sql');
await runSQL('/workspace/app/supabase/step4-boq.sql', 'step4-boq.sql');
