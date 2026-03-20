import crypto from 'crypto';

const SESSION_COOKIE = 'vadeo_session';
const STATE_COOKIE = 'vadeo_oauth_state';

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Missing AUTH_SECRET');
  }
  return secret;
};

const getCookieOptions = () => [
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Lax',
];

const appendCookie = (res, cookieValue) => {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  const next = Array.isArray(existing) ? [...existing, cookieValue] : [existing, cookieValue];
  res.setHeader('Set-Cookie', next);
};

export const parseCookies = (req) => {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};

export const signSession = (payload) => {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url');

  return `${body}.${signature}`;
};

export const verifySession = (value) => {
  if (!value) return null;

  const [body, signature] = value.split('.');
  if (!body || !signature) return null;

  const expected = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(body));
  } catch {
    return null;
  }
};

export const getBaseUrl = (req) => {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, '');
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
};

export const getAdminEmails = () => {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
};

export const buildSessionPayload = (user) => ({
  id: user.sub,
  email: user.email,
  full_name: user.name,
  picture: user.picture,
  is_admin: getAdminEmails().includes((user.email || '').toLowerCase()),
  iat: Date.now(),
});

export const setSessionCookie = (res, payload) => {
  const token = signSession(payload);
  appendCookie(res, `${SESSION_COOKIE}=${token}; ${getCookieOptions().join('; ')}`);
};

export const clearSessionCookie = (res) => {
  appendCookie(res, `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
};

export const setStateCookie = (res, value) => {
  appendCookie(res, `${STATE_COOKIE}=${encodeURIComponent(value)}; ${getCookieOptions().join('; ')}; Max-Age=600`);
};

export const clearStateCookie = (res) => {
  appendCookie(res, `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
};

export const getSessionFromRequest = (req) => {
  const cookies = parseCookies(req);
  const payload = verifySession(cookies[SESSION_COOKIE]);
  return payload || null;
};

export const getStateFromRequest = (req) => {
  const cookies = parseCookies(req);
  return cookies[STATE_COOKIE] || null;
};
