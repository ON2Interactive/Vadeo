import { clearSessionCookie } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  clearSessionCookie(res);
  if (req.method === 'GET') {
    res.redirect('/signup');
    return;
  }

  res.status(200).json({ success: true });
}
