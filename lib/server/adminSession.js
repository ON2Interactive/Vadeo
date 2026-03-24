import { createHash, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from './supabaseAdmin.js';

const ADMIN_COOKIE_NAME = 'vadeo_admin_session';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const getCookieOptions = () => ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax'];

const appendCookie = (res, cookieValue) => {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }
  const next = Array.isArray(existing) ? [...existing, cookieValue] : [existing];
  next.push(cookieValue);
  res.setHeader('Set-Cookie', next);
};

const parseCookies = (req) => {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};

const secureEqual = (left, right) => {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

const hashToken = (value) => createHash('sha256').update(value).digest('hex');

const getRequiredAdminEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

export const isValidAdminLogin = (email, password) => {
  const expectedEmail = getRequiredAdminEnv('ADMIN_LOGIN_EMAIL').trim().toLowerCase();
  const expectedPassword = getRequiredAdminEnv('ADMIN_LOGIN_PASSWORD');
  return secureEqual(String(email || '').trim().toLowerCase(), expectedEmail) && secureEqual(String(password || ''), expectedPassword);
};

const getAdminSessionValue = () => {
  const email = getRequiredAdminEnv('ADMIN_LOGIN_EMAIL').trim().toLowerCase();
  const password = getRequiredAdminEnv('ADMIN_LOGIN_PASSWORD');
  return hashToken(`${email}:${password}`);
};

export const setAdminSessionCookie = (res) => {
  appendCookie(
    res,
    `${ADMIN_COOKIE_NAME}=${getAdminSessionValue()}; ${getCookieOptions().join('; ')}; Max-Age=${ADMIN_SESSION_MAX_AGE}`
  );
};

export const clearAdminSessionCookie = (res) => {
  appendCookie(res, `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
};

export const hasValidAdminSession = (req) => {
  const cookies = parseCookies(req);
  const stored = cookies[ADMIN_COOKIE_NAME] || '';
  if (!stored) return false;
  return secureEqual(stored, getAdminSessionValue());
};

export const requireAdminSession = (req, res) => {
  if (!hasValidAdminSession(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
};

const getTrialLeftLabel = (startedAt, expiresAt) => {
  if (!startedAt || !expiresAt) return 'Not started';
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return 'Unknown';
  const diff = expiresAtMs - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.ceil(diff / (60 * 60 * 1000));
  return `${hours}h`;
};

export const listAdminUsers = async () => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      app_user_id,
      email,
      full_name,
      credits,
      is_admin,
      created_at,
      updated_at,
      user_subscriptions (
        plan,
        status,
        cancel_at_period_end,
        current_period_end
      ),
      user_trials (
        started_at,
        expires_at,
        motion_downloads_used
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => {
    const subscription = Array.isArray(row.user_subscriptions) ? row.user_subscriptions[0] : row.user_subscriptions;
    const trial = Array.isArray(row.user_trials) ? row.user_trials[0] : row.user_trials;
    return {
      id: row.app_user_id,
      email: row.email,
      full_name: row.full_name,
      credits: row.credits || 0,
      is_admin: Boolean(row.is_admin),
      created_at: row.created_at,
      updated_at: row.updated_at,
      plan: subscription?.plan || 'none',
      status: subscription?.status || 'inactive',
      cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
      current_period_end: subscription?.current_period_end || null,
      trial_claimed: Boolean(trial?.started_at),
      trial_left: getTrialLeftLabel(trial?.started_at, trial?.expires_at),
      motion_downloads_used: trial?.motion_downloads_used || 0,
    };
  });
};

export const getAdminStats = async () => {
  const users = await listAdminUsers();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    totalUsers: users.length,
    totalCredits: users.reduce((sum, user) => sum + (user.credits || 0), 0),
    joinsToday: users.filter((user) => new Date(user.created_at) >= today).length,
  };
};

export const updateAdminUser = async (id, updates) => {
  const supabase = getSupabaseAdmin();
  const profileUpdates = {};
  if (typeof updates.credits === 'number') profileUpdates.credits = Math.max(0, Math.round(updates.credits));
  if (typeof updates.is_admin === 'boolean') profileUpdates.is_admin = updates.is_admin;
  if (typeof updates.full_name === 'string') profileUpdates.full_name = updates.full_name.trim() || null;

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('app_user_id', id);
    if (error) throw new Error(error.message);
  }
};

export const deleteAdminUser = async (id) => {
  const supabase = getSupabaseAdmin();
  const deleteTables = ['projects', 'generation_usage', 'user_trials', 'user_subscriptions', 'user_profiles'];
  for (const table of deleteTables) {
    const { error } = await supabase.from(table).delete().eq('app_user_id', id);
    if (error) throw new Error(error.message);
  }
};
