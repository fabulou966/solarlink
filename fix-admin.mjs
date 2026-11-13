import { createClient } from '@supabase/supabase-js';

const url = 'https://hmimlfdogizptfotwwxc.supabase.co';
const key = 'sb_secret_UyXhrSKFQiyzY3qIf9C3Mg_GFFavQ6k';

const db = createClient(url, key, { auth: { persistSession: false } });

async function fix() {
  const email = 'fouad2229@gmail.com';
  
  // Get user ID from auth
  const { data: users } = await db.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.log('User not found in auth');
    return;
  }
  
  console.log(`Adding ${email} (${user.id}) to admins...`);
  
  const { error } = await db.from('admins').upsert({
    user_id: user.id,
    email: user.email
  });
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✓ Admin added successfully');
  }
  
  // Verify
  const { data: admins } = await db.from('admins').select('*');
  console.log('Admins now:', admins);
}

fix();
