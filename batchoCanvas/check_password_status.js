
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPasswords() {
    const email = process.env.VITE_ADMIN_EMAIL || 'kipme001@gmail.com';
    const oldPassword = 'BatchoVideo@$@$';
    const newPassword = 'BatchoCanvas@$@$';

    console.log(`Checking admin login for ${email}...`);

    // Check old
    const { data: oldData, error: oldError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
    });

    if (!oldError) {
        console.log('Login successful with OLD password (BatchoVideo@$@$). Proceeding to update...');
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) {
            console.error('Update failed:', updateError.message);
        } else {
            console.log('Password successfully updated to new one!');
        }
        return;
    }

    // Check new
    const { data: newData, error: newError } = await supabase.auth.signInWithPassword({
        email,
        password: newPassword,
    });

    if (!newError) {
        console.log('Login successful with NEW password (BatchoCanvas@$@$). Database is already in sync.');
    } else {
        console.error('Login failed with both old and new passwords.');
        console.error('Old PW Error:', oldError.message);
        console.error('New PW Error:', newError.message);
    }
}

checkPasswords();
