import { clearAdminSessionCookie } from './_utils.js';

export default async function handler(req, res) {
  if (!['POST', 'GET'].includes(req.method || '')) {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  clearAdminSessionCookie(res);
  if (req.method === 'GET') {
    res.writeHead(302, { Location: '/admin-login' });
    res.end();
    return;
  }

  res.status(200).json({ ok: true });
}
