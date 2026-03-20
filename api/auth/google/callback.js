import {
  buildSessionPayload,
  clearStateCookie,
  getBaseUrl,
  getStateFromRequest,
  setSessionCookie,
} from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { code, state } = req.body || {};
    if (!code || !state) {
      res.status(400).json({ error: 'Missing OAuth code or state' });
      return;
    }

    const storedState = getStateFromRequest(req);
    if (!storedState || storedState !== state) {
      res.status(400).json({ error: 'Invalid OAuth state' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(500).json({ error: 'Missing Google OAuth server credentials' });
      return;
    }

    const redirectUri = `${getBaseUrl(req)}/auth/google/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      res.status(400).json({ error: tokenPayload.error_description || tokenPayload.error || 'Failed to exchange Google OAuth code' });
      return;
    }

    const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });
    const user = await userResponse.json();
    if (!userResponse.ok || !user.email) {
      res.status(400).json({ error: 'Failed to load Google profile' });
      return;
    }

    const sessionPayload = buildSessionPayload(user);
    const redirect = (() => {
      try {
        return JSON.parse(Buffer.from(state, 'base64url').toString('utf8')).redirect || '/dashboard';
      } catch {
        return '/dashboard';
      }
    })();

    clearStateCookie(res);
    setSessionCookie(res, sessionPayload);
    res.status(200).json({ success: true, redirect, user: sessionPayload });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: error.message || 'Google OAuth failed' });
  }
}
