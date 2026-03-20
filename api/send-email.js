
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

        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

        if (!SENDGRID_API_KEY) {
            console.error('Missing SENDGRID_API_KEY');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        // 1. Prepare Admin Context
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
        } else if (type === 'purchase') {
            adminSubject = 'New Credit Purchase 💰';
            const { planName, credits, price } = JSON.parse(message);
            adminContent = `
            <h3>New Purchase!</h3>
            <p><strong>User Email:</strong> ${to}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Credits:</strong> ${credits}</p>
            <p><strong>Amount:</strong> $${price}</p>
            `;
        }

        const emailPromises = [];

        // Push Admin Notification
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

        // 2. Prepare Welcome Email (Only for signup)
        if (type === 'signup') {
            const welcomeSubject = "Welcome to batchoCanvas";
            const welcomeContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #000;">Welcome to batchoCanvas.</h1>
                <p>You now have access to a new kind of design canvas—one built for structure, layout, and motion. Design with layers, scenes, grids, and grouping, then export exactly what you need, from Videos to PDFs.</p>
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
                        email: to,
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
