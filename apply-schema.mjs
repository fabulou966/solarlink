import { createClient } from '@supabase/supabase-js';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

// Create tables directly via the client
async function setup() {
  console.log('Creating tables...');
  
  // 1. projects table
  const { error: e1 } = await db.rpc('create_projects_table', {});
  console.log('projects:', e1?.message || 'OK');
  
  // 2. project_images table
  const { error: e2 } = await db.rpc('create_project_images_table', {});
  console.log('project_images:', e2?.message || 'OK');
  
  // 3. quote_requests table
  const { error: e3 } = await db.rpc('create_quote_requests_table', {});
  console.log('quote_requests:', e3?.message || 'OK');
  
  // 4. admins table
  const { error: e4 } = await db.rpc('create_admins_table', {});
  console.log('admins:', e4?.message || 'OK');
  
  // 5. is_admin function
  const { error: e5 } = await db.rpc('create_is_admin_function', {});
  console.log('is_admin:', e5?.message || 'OK');
  
  console.log('Done. Check Supabase Dashboard for results.');
}

setup();
