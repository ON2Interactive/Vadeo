
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSupabasePassword() {
    const email = process.env.VITE_ADMIN_EMAIL || 'kipme001@gmail.com';
    const currentSupabasePassword = 'Ann1113@$@$001';
    const targetPassword = 'BatchoCanvas@$@$';

    console.log(`Attempting to sync Supabase password for ${email}...`);

    // 1. Try to login with the password provided by user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: currentSupabasePassword,
    });

    if (loginError) {
        // 2. If it fails, check if it's already updated to the target
        const { error: targetError } = await supabase.auth.signInWithPassword({
            email,
            password: targetPassword,
        });

        if (!targetError) {
            console.log('Admin password is already set to BatchoCanvas@$@$ in Supabase.');
            return;
        }

        console.error('Failed to log in with current or target password.');
        console.error('Error:', loginError.message);
        return;
    }

    console.log('Login successful with current credentials. Updating to requested password...');

    // 3. Update to the target password
    const { error: updateError } = await supabase.auth.updateUser({
        password: targetPassword
    });

    if (updateError) {
        console.error('Failed to update password in Supabase:', updateError.message);
    } else {
        console.log('Admin password successfully updated to BatchoCanvas@$@$ in Supabase!');
    }
}

updateSupabasePassword();
