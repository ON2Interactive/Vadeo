import { hasValidAdminSession } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  res.status(200).json({ authenticated: hasValidAdminSession(req) });
}
