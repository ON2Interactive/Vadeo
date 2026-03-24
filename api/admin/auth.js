import { isValidAdminLogin, setAdminSessionCookie } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const email = String(body?.email || '');
    const password = String(body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    if (!isValidAdminLogin(email, password)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    setAdminSessionCookie(res);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected admin login error.' });
  }
}
