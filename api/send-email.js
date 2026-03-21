const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const getFromEmail = () => String(process.env.SENDGRID_FROM_EMAIL || '').trim();
const getDefaultNotifyEmail = () =>
    normalizeEmail(
        process.env.SIGNUP_NOTIFY_EMAIL ||
        process.env.CONTACT_TO_EMAIL ||
        process.env.SENDGRID_TO_EMAIL ||
        getFromEmail() ||
        'hello@vadeo.cloud'
    );

const getAppBaseUrl = (req) => {
    if (process.env.APP_BASE_URL) {
        return process.env.APP_BASE_URL.replace(/\/$/, '');
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`;
};

const sendSendgridMail = async ({ apiKey, fromEmail, toEmail, subject, textBody, htmlBody }) => {
    return fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: toEmail }], subject }],
            from: { email: fromEmail, name: 'Vadeo' },
            content: [
                { type: 'text/plain', value: textBody },
                { type: 'text/html', value: htmlBody },
            ],
        }),
    });
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { to, subject, message, type } = req.body;

        if (!to || !subject || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const SENDGRID_API_KEY = String(process.env.SENDGRID_API_KEY || '').trim();
        const fromEmail = getFromEmail();
        const notifyEmail = getDefaultNotifyEmail();

        if (!SENDGRID_API_KEY) {
            console.error('Missing SENDGRID_API_KEY');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        if (!fromEmail) {
            console.error('Missing SENDGRID_FROM_EMAIL');
            res.status(500).json({ error: 'Missing sender configuration' });
            return;
        }

        // 1. Prepare Admin Context
        let adminSubject = subject;
        let adminContent = message;

        if (type === 'signup') {
            adminSubject = 'Vadeo: New user signup';
            adminContent = `
            <h3>New user signup</h3>
            <p><strong>Email:</strong> ${escapeHtml(to)}</p>
            <p><strong>Name:</strong> ${escapeHtml(message)}</p>
        `;
        } else if (type === 'contact') {
            adminContent = `
            <h3>New Contact Form Submission</h3>
            <p><strong>From:</strong> ${escapeHtml(to)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message)}</p>
        `;
        } else if (type === 'purchase') {
            adminSubject = 'Vadeo: New subscription purchase';
            const { planName, credits, price } = JSON.parse(message);
            adminContent = `
            <h3>New Purchase!</h3>
            <p><strong>User Email:</strong> ${escapeHtml(to)}</p>
            <p><strong>Plan:</strong> ${escapeHtml(planName)}</p>
            <p><strong>Credits:</strong> ${escapeHtml(String(credits ?? '—'))}</p>
            <p><strong>Amount:</strong> $${escapeHtml(String(price ?? '—'))}</p>
            `;
        }

        const emailPromises = [];

        // Push Admin Notification
        if (isValidEmail(notifyEmail)) {
            emailPromises.push(sendSendgridMail({
                apiKey: SENDGRID_API_KEY,
                fromEmail,
                toEmail: notifyEmail,
                subject: adminSubject,
                textBody: `${adminSubject}\n\n${String(message || '').trim()}`,
                htmlBody: adminContent,
            }));
        }

        // 2. Prepare Welcome Email (Only for signup)
        if (type === 'signup') {
            const safeName = String(message || '').trim() || 'there';
            const firstName = safeName.split(/\s+/)[0] || 'there';
            const pricingUrl = `${getAppBaseUrl(req)}/pricing`;
            const welcomeSubject = "Welcome to Vadeo";
            const welcomeText = [
                `Hi ${firstName},`,
                '',
                'Welcome to Vadeo.',
                '',
                'Your account is ready.',
                '',
                'Vadeo is designed to help you turn product shots and campaign images into polished video ads faster. You can build scenes, shape layouts, generate motion with AI, and export campaign-ready creative from one workspace.',
                '',
                "Here's what you can do right away:",
                '- Choose the plan that fits your workflow',
                '- Build your first ad scene in the workspace',
                '- Generate motion from your visuals with AI',
                '- Export polished creative for campaigns and social',
                '',
                `Open pricing: ${pricingUrl}`,
                '',
                'To get started:',
                '1. Choose your plan',
                '2. Open the editor',
                '3. Build and generate your first video ad',
                '',
                'We look forward to seeing what you create with Vadeo.',
                '',
                'The Vadeo Team',
            ].join('\n');
            const welcomeContent = `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6;font-size:16px;">
                <p>Hi ${escapeHtml(firstName)},</p>
                <p>Welcome to Vadeo.</p>
                <p>Your account is ready.</p>
                <p>Vadeo is designed to help you turn product shots and campaign images into polished video ads faster. You can build scenes, shape layouts, generate motion with AI, and export campaign-ready creative from one workspace.</p>
                <p>Here’s what you can do right away:</p>
                <ul style="padding-left:20px;">
                    <li>Choose the plan that fits your workflow</li>
                    <li>Build your first ad scene in the workspace</li>
                    <li>Generate motion from your visuals with AI</li>
                    <li>Export polished creative for campaigns and social</li>
                </ul>
                <div style="margin:30px 0;">
                    <a href="${escapeHtml(pricingUrl)}" style="background-color:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Choose a Vadeo plan →</a>
                </div>
                <p>To get started:</p>
                <ol style="padding-left:20px;">
                    <li>Choose your plan</li>
                    <li>Open the editor</li>
                    <li>Build and generate your first video ad</li>
                </ol>
                <p>We look forward to seeing what you create with Vadeo.</p>
                <p>The Vadeo Team</p>
            </div>
        `;

            emailPromises.push(sendSendgridMail({
                apiKey: SENDGRID_API_KEY,
                fromEmail,
                toEmail: normalizeEmail(to),
                subject: welcomeSubject,
                textBody: welcomeText,
                htmlBody: welcomeContent,
            }));
        }

        // 3. Add to SendGrid Contacts (Marketing) - Only for signup
        if (type === 'signup') {
            const firstName = message.split(' ')[0] || '';
            const lastName = message.split(' ').slice(1).join(' ') || '';

            const listIds = process.env.SENDGRID_LIST_ID ? [process.env.SENDGRID_LIST_ID] : [];

            emailPromises.push(fetch('https://api.sendgrid.com/v3/marketing/contacts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SENDGRID_API_KEY}`,
                },
                body: JSON.stringify({
                    list_ids: listIds,
                    contacts: [{
                        email: normalizeEmail(to),
                        first_name: firstName,
                        last_name: lastName
                    }]
                }),
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    console.error('Failed to add contact to SendGrid:', err);
                    // Don't throw here, as email sending is more important
                } else {
                    console.log('Successfully added contact to SendGrid');
                }
                return res;
            }));
        }

        // Execute all email sends
        const responses = await Promise.all(emailPromises);

        // Check for errors
        for (const r of responses) {
            if (!r.ok) {
                const errorData = await r.json().catch(() => ({}));
                console.error("SendGrid Error:", errorData);
                throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
            }
        }

        res.status(200).json({ success: true, count: responses.length });

    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({ error: error.message });
    }
}
