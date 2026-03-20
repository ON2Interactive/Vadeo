
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getAdminId() {
    const email = process.env.VITE_ADMIN_EMAIL || 'kipme001@gmail.com';
    const password = process.env.VITE_ADMIN_PASSWORD || 'BatchoVideo@$@$';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login failed:', error.message);
        return;
    }

    if (data.user) {
        console.log(`ADMIN_UUID: ${data.user.id}`);
    } else {
        console.error('No user data returned');
    }
}

getAdminId();
