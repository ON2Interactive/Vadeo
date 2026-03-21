import { createClient } from '@supabase/supabase-js';
import { getSessionFromRequest } from '../../api/auth/_utils.js';

export const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;
export const PLAN_GENERATION_LIMIT = 20;

const PLAN_FROM_PRICE_ID = {
  price_1TDA81PS7A6w1qKNbfSiBBDA: 'starter',
  price_1TDA9gPS7A6w1qKNjZmhivpd: 'standard',
  price_1TDAAfPS7A6w1qKNJmziQDG6: 'premium',
};

export const getSupabaseAdmin = () => {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const requireSession = (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
};

export const ensureUserRecords = async (supabase, session) => {
  const profilePayload = {
    app_user_id: session.id,
    email: session.email,
    full_name: session.full_name || session.email?.split('@')[0] || 'Vadeo User',
    picture: session.picture || null,
    is_admin: Boolean(session.is_admin),
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(profilePayload, { onConflict: 'app_user_id' });

  if (profileError) throw profileError;

  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .upsert({ app_user_id: session.id }, { onConflict: 'app_user_id', ignoreDuplicates: false });

  if (subscriptionError) throw subscriptionError;

  const { error: usageError } = await supabase
    .from('generation_usage')
    .upsert({ app_user_id: session.id }, { onConflict: 'app_user_id', ignoreDuplicates: false });

  if (usageError) throw usageError;

  const { error: trialError } = await supabase
    .from('user_trials')
    .upsert({ app_user_id: session.id }, { onConflict: 'app_user_id', ignoreDuplicates: false });

  if (trialError) throw trialError;
};

export const getTrialStateFromRow = (row) => {
  const startedAt = row?.started_at || null;
  const expiresAt = row?.expires_at || null;

  if (!startedAt || !expiresAt) {
    return { status: 'none', startedAt: null, expiresAt: null };
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return { status: 'none', startedAt: null, expiresAt: null };
  }

  return {
    status: expiresAtMs > Date.now() ? 'active' : 'expired',
    startedAt,
    expiresAt,
  };
};

export const getPlanFromSubscription = (row) => {
  const plan = row?.plan;
  return plan === 'starter' || plan === 'standard' || plan === 'premium' ? plan : null;
};

export const getRemainingGenerations = (plan, used) => {
  if (plan !== 'standard' && plan !== 'premium') return 0;
  return Math.max(0, PLAN_GENERATION_LIMIT - (used || 0));
};

export const mapPriceIdToPlan = (priceId) => PLAN_FROM_PRICE_ID[priceId] || null;
