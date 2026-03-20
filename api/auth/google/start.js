import crypto from 'crypto';
import { getBaseUrl, setStateCookie } from '../_utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID' });
    return;
  }

  const redirectTarget = typeof req.query.redirect === 'string' ? req.query.redirect : '/dashboard';
  const statePayload = {
    nonce: crypto.randomBytes(16).toString('hex'),
    redirect: redirectTarget,
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  setStateCookie(res, state);

  const redirectUri = `${getBaseUrl(req)}/auth/google/callback`;
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  res.redirect(authUrl.toString());
}
