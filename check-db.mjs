import { createClient } from '@supabase/supabase-js';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

async function check() {
  console.log('Checking database...');
  
  // Check projects table
  const { data: projects, error: e1 } = await db.from('projects').select('*').limit(5);
  console.log('projects:', e1?.message || `found ${projects?.length || 0} rows`);
  
  // Check project_images
  const { data: images, error: e2 } = await db.from('project_images').select('*').limit(5);
  console.log('project_images:', e2?.message || `found ${images?.length || 0} rows`);
  
  // Check quote_requests
  const { data: quotes, error: e3 } = await db.from('quote_requests').select('*').limit(5);
  console.log('quote_requests:', e3?.message || `found ${quotes?.length || 0} rows`);
  
  // Check admins
  const { data: admins, error: e4 } = await db.from('admins').select('*').limit(5);
  console.log('admins:', e4?.message || `found ${admins?.length || 0} rows`);
  
  // Check storage buckets
  const { data: buckets, error: e5 } = await db.storage.listBuckets();
  console.log('buckets:', e5?.message || buckets?.map(b => b.name).join(', '));
  
  // Test is_admin function
  const { data: isAdmin, error: e6 } = await db.rpc('is_admin');
  console.log('is_admin():', e6?.message || isAdmin);
}

check();
