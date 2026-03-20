
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePassword() {
    const email = process.env.VITE_ADMIN_EMAIL || 'kipme001@gmail.com';
    const oldPassword = 'BatchoVideo@$@$';
    const newPassword = 'BatchoCanvas@$@$';

    console.log(`Attempting to login as ${email}...`);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
    });

    if (signInError) {
        console.error('Login failed (maybe password already updated?):', signInError.message);
        return;
    }

    console.log('Login successful. Updating password...');

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        console.error('Password update failed:', updateError.message);
    } else {
        console.log('Password successfully updated in Supabase!');
    }
}

updatePassword();
