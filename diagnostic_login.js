
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticLogin() {
    const emails = ['kipme001@gmail.com', 'hello@batchocanvas.com'];
    const passwords = ['Ann1113@$@$001', 'BatchoVideo@$@$', 'BatchoCanvas@$@$'];

    for (const email of emails) {
        for (const password of passwords) {
            console.log(`Testing Login: ${email} / ${password}`);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) {
                console.log(`>>> SUCCESS: Logged in as ${email} with password ${password}`);

                if (password !== 'BatchoCanvas@$@$') {
                    console.log('Attemping to update password to BatchoCanvas@$@$...');
                    const { error: updateError } = await supabase.auth.updateUser({ password: 'BatchoCanvas@$@$' });
                    if (updateError) {
                        console.error('Update failed:', updateError.message);
                    } else {
                        console.log('Password successfully updated!');
                    }
                }
                return;
            } else {
                console.log(`Failed: ${error.message}`);
            }
        }
    }
    console.log('All login attempts failed.');
}

diagnosticLogin();
