
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getFromEmail = () => {
    const fromEmail = normalizeEmail(Deno.env.get('SENDGRID_FROM_EMAIL') || '');
    if (!fromEmail || !isValidEmail(fromEmail)) {
        throw new Error('Missing or invalid SENDGRID_FROM_EMAIL');
    }
    return fromEmail;
};

const getDefaultNotifyEmail = (type: string) => {
    const specificTarget =
        type === 'signup'
            ? Deno.env.get('SIGNUP_NOTIFY_EMAIL')
            : type === 'contact'
              ? Deno.env.get('CONTACT_TO_EMAIL')
              : undefined;

    const fallbackTarget = Deno.env.get('SENDGRID_TO_EMAIL');
    const target = normalizeEmail(specificTarget || fallbackTarget || '');

    if (!target || !isValidEmail(target)) {
        throw new Error('Missing notification recipient email');
    }

    return target;
};

const getAppBaseUrl = () =>
    (Deno.env.get('APP_BASE_URL') || 'https://vadeo.cloud').replace(/\/+$/, '');

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { to, subject, message, type, token } = await req.json();

        if (!to || !subject || !message) {
            throw new Error('Missing required fields');
        }

        const normalizedTo = normalizeEmail(String(to));
        if (!isValidEmail(normalizedTo)) {
            throw new Error('Invalid recipient email');
        }

        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        if (!SENDGRID_API_KEY) {
            throw new Error('Missing SENDGRID_API_KEY');
        }

        const fromEmail = getFromEmail();
        const notifyEmail = getDefaultNotifyEmail(type);
        const appBaseUrl = getAppBaseUrl();

        let adminSubject = subject;
        let adminContent = `<p>${escapeHtml(String(message))}</p>`;

        if (type === 'signup') {
            adminSubject = 'Vadeo: New user signup';
            adminContent = `
                <h3>New Vadeo signup</h3>
                <p><strong>Email:</strong> ${escapeHtml(normalizedTo)}</p>
                <p><strong>Name:</strong> ${escapeHtml(String(message))}</p>
            `;
        } else if (type === 'contact') {
            adminSubject = 'Vadeo: New contact submission';
            adminContent = `
                <h3>New Vadeo contact form submission</h3>
                <p><strong>From:</strong> ${escapeHtml(normalizedTo)}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(String(message)).replaceAll('\n', '<br/>')}</p>
            `;
        } else if (type === 'purchase') {
            adminSubject = 'Vadeo: New subscription purchase';
            adminContent = `
                <h3>New Vadeo subscription purchase</h3>
                <p><strong>Email:</strong> ${escapeHtml(normalizedTo)}</p>
                <p><strong>Plan:</strong> ${escapeHtml(String(message))}</p>
            `;
        }

        const emailPromises = [];

        emailPromises.push(fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${SENDGRID_API_KEY}`,
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: notifyEmail }], subject: adminSubject }],
                from: { email: fromEmail, name: 'Vadeo' },
                content: [{ type: 'text/html', value: adminContent }],
            }),
        }));

        if (type === 'signup') {
            const welcomeSubject = "Welcome to Vadeo";
            const welcomeContent = `
                <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h1 style="color: #111;">Welcome to Vadeo.</h1>
                    <p>You’re in. Vadeo is built to turn product shots, campaign imagery, and creative direction into polished video ads without the usual production drag.</p>
                    <p><strong>A clean place to start:</strong></p>
                    <ul>
                        <li>Choose the plan that fits your workflow</li>
                        <li>Open the editor and set up your first project</li>
                        <li>Generate and refine your first video ad</li>
                    </ul>
                    <p>We’ve kept the workflow tight so you can move from concept to usable ad creative quickly.</p>
                    <div style="margin-top: 28px; margin-bottom: 28px;">
                        <a href="${appBaseUrl}/pricing" style="background-color: #111; color: #fff; padding: 14px 22px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block;">Choose Your Plan</a>
                    </div>
                    <p style="color: #666;">Once you’re set, head into the editor and build your first Vadeo project.</p>
                    <p style="color: #666; font-size: 12px;">— The Vadeo Team</p>
                </div>
            `;

            emailPromises.push(fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SENDGRID_API_KEY}`,
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: normalizedTo }], subject: welcomeSubject }],
                    from: { email: fromEmail, name: 'Vadeo' },
                    content: [{ type: 'text/html', value: welcomeContent }],
                }),
            }));
        }

        const responses = await Promise.all(emailPromises);

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
