import { clearSessionCookie } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  clearSessionCookie(res);
  res.status(200).json({ success: true });
}
