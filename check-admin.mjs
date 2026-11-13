import { createClient } from '@supabase/supabase-js';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

async function check() {
  // Check auth users
  const { data: users, error: e1 } = await db.auth.admin.listUsers();
  console.log('Auth Users:');
  users?.users.forEach(u => console.log(`  - ${u.email} (id: ${u.id})`));
  
  // Check admins table
  const { data: admins, error: e2 } = await db.from('admins').select('*');
  console.log('\nAdmins table:');
  admins?.forEach(a => console.log(`  - ${a.email} (user_id: ${a.user_id})`));
  
  if (e2) console.log('Error:', e2.message);
}

check();
