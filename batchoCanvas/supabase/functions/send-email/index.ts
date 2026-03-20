
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { to, subject, message, type, token } = await req.json();

        // Validate inputs
        if (!to || !subject || !message) {
            throw new Error('Missing required fields');
        }

        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        if (!SENDGRID_API_KEY) {
            throw new Error('Missing SENDGRID_API_KEY');
        }

        // 1. Prepare Admin Admin Context
        let adminSubject = subject;
        let adminContent = message;

        if (type === 'signup') {
            adminSubject = 'New User Signup Notification';
            adminContent = `
            <h3>New User Signup!</h3>
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Name:</strong> ${message}</p>
        `;
        } else if (type === 'contact') {
            adminContent = `
            <h3>New Contact Form Submission</h3>
            <p><strong>From:</strong> ${to}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;
        }

        const emailPromises = [];

        // Push Admin Notification (Always sent to hello@batchocanvas.com)
        emailPromises.push(fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${SENDGRID_API_KEY}`,
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: 'hello@batchocanvas.com' }], subject: adminSubject }],
                from: { email: 'hello@batchocanvas.com', name: 'BatchoCanvas Bot' },
                content: [{ type: 'text/html', value: adminContent }],
            }),
        }));

        // 2. Prepare Welcome Email (Only for signup, sent to the User)
        if (type === 'signup') {
            const welcomeSubject = "Welcome to batchoCanvas";
            const welcomeContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #000;">Welcome to batchoCanvas.</h1>
                <p>You now have access to a new kind of design canvas—one built for structure, layout, and motion. Design with layers, scenes, grids, and grouping, then export exactly what you need, from MP4s to PDFs.</p>
                <p>There’s no timeline to manage and no rigid workflow to learn. Everything starts on the canvas.</p>
                <p><strong>A simple way to begin:</strong></p>
                <ul>
                    <li>Add content to the canvas</li>
                    <li>Arrange and layer with precision</li>
                    <li>Export when it’s ready</li>
                </ul>
                <p>batchoCanvas is designed to stay out of your way and give you control where it matters.</p>
                <p><strong>Verification Required:</strong> If you haven't verified your email yet, please do so now to unlock all features.</p>
                <br/>
                <p>Start creating when you’re ready.</p>
                <div style="margin-top: 25px;">
                    <a href="https://www.batchocanvas.com/signin" style="background-color: #667eea; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email & Start Creating →</a>
                </div>
                <br/>
                <p style="color: #888; fontSize: 12px;">— The batchoCanvas Team</p>
            </div>

        `;

            emailPromises.push(fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SENDGRID_API_KEY}`,
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }], subject: welcomeSubject }],
                    from: { email: 'hello@batchocanvas.com', name: 'batchoCanvas Team' },
                    content: [{ type: 'text/html', value: welcomeContent }],
                }),
            }));
        }

        // Execute all email sends
        const responses = await Promise.all(emailPromises);

        // Check for errors in any response
        for (const res of responses) {
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("SendGrid Error:", data);
                throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
            }
        }

        const data = { success: true, count: responses.length };

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
