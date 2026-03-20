
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUsers() {
    console.log('Seeding users...');

    // 1. Ensure Admin User exists
    const adminEmail = process.env.VITE_ADMIN_EMAIL || 'kipme001@gmail.com';
    const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'BatchoCanvas@$@$';

    console.log(`Checking/Creating Admin: ${adminEmail}`);
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
            data: { full_name: 'Super Admin' }
        }
    });

    if (adminError) {
        console.log('Admin creation info:', adminError.message);
        // Usually "User already registered" which is fine
    } else {
        console.log('Admin user created/verified');
    }

    // 2. Create a Test User
    const testEmail = 'testuser@batchocanvas.com';
    const testPassword = 'Password123!';

    console.log(`Creating Test User: ${testEmail}`);
    const { data: testData, error: testError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: { full_name: 'Test Customer' }
        }
    });

    if (testError) {
        console.log('Test user creation info:', testError.message);
    } else {
        console.log('Test user created');
    }
}

seedUsers();
