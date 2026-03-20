import { getSessionFromRequest } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const session = getSessionFromRequest(req);
  res.status(200).json({
    authenticated: Boolean(session),
    user: session,
  });
}
