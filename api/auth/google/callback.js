import {
  buildSessionPayload,
  clearStateCookie,
  getBaseUrl,
  getStateFromRequest,
  parseCookies,
  setSessionCookie,
} from '../_utils.js';
import crypto from 'crypto';

const WELCOME_COOKIE_PREFIX = 'vadeo_welcome_';

const appendCookie = (res, cookieValue) => {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  const next = Array.isArray(existing) ? [...existing, cookieValue] : [existing, cookieValue];
  res.setHeader('Set-Cookie', next);
};

const getWelcomeCookieName = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const digest = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `${WELCOME_COOKIE_PREFIX}${digest}`;
};

const setWelcomeCookie = (res, email) => {
  appendCookie(
    res,
    `${getWelcomeCookieName(email)}=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
  );
};

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

    const cookies = parseCookies(req);
    const shouldSendWelcome = redirect === '/pricing' && !cookies[getWelcomeCookieName(user.email)];

    if (shouldSendWelcome) {
      try {
        const emailResponse = await fetch(`${getBaseUrl(req)}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: 'Welcome to Vadeo',
            message: user.name || user.email,
            type: 'signup',
          }),
        });

        if (emailResponse.ok) {
          setWelcomeCookie(res, user.email);
        } else {
          const payload = await emailResponse.json().catch(() => ({}));
          console.error('Failed to send Vadeo welcome email:', payload);
        }
      } catch (emailError) {
        console.error('Failed to trigger welcome email:', emailError);
      }
    }

    clearStateCookie(res);
    setSessionCookie(res, sessionPayload);
    res.status(200).json({ success: true, redirect, user: sessionPayload });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: error.message || 'Google OAuth failed' });
  }
}
