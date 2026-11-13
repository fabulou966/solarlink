import { createClient } from '@supabase/supabase-js';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

async function verify() {
  console.log('=== Database Verification ===\n');
  
  // Projects
  const { data: projects, error: e1 } = await db.from('projects').select('*');
  console.log('Projects:', projects?.length || 0);
  projects?.forEach(p => console.log(`  - ${p.slug}: ${p.title_en} (published: ${p.published})`));
  
  // Project images
  const { data: images, error: e2 } = await db.from('project_images').select('*');
  console.log('\nProject Images:', images?.length || 0);
  images?.forEach(i => console.log(`  - ${i.path} (sort: ${i.sort_order})`));
  
  // Storage buckets
  const { data: buckets, error: e3 } = await db.storage.listBuckets();
  console.log('\nStorage Buckets:', buckets?.map(b => b.name).join(', '));
  
  // Check bucket contents
  if (buckets) {
    for (const bucket of buckets) {
      const { data: files } = await db.storage.from(bucket.name).list('', { limit: 20 });
      console.log(`  ${bucket.name}: ${files?.length || 0} files`);
      files?.slice(0, 5).forEach(f => console.log(`    - ${f.name}`));
    }
  }
  
  // Test public URLs
  console.log('\n=== Public URL Tests ===');
  const testPaths = [
    'hybrid-30kw/cover.webp',
    'hybrid-30kw/cover-thumb.webp',
    'hybrid-30kw/inverter.webp',
  ];
  for (const path of testPaths) {
    const publicUrl = `${url}/storage/v1/object/public/project-photos/${path}`;
    const res = await fetch(publicUrl, { method: 'HEAD' });
    console.log(`  ${path}: ${res.ok ? '✓' : '✗'} (${res.status})`);
  }
}

verify();
