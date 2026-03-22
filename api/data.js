import {
  ensureUserRecords,
  getPlanFromSubscription,
  getRemainingGenerations,
  getSupabaseAdmin,
  getTrialStateFromRow,
  mapPriceIdToPlan,
  PLAN_GENERATION_LIMIT,
  requireSession,
  TRIAL_DURATION_MS,
} from '../lib/server/supabaseAdmin.js';

const ensureAdmin = (session, res) => {
  if (!session?.is_admin) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
};

export default async function handler(req, res) {
  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

    const scope = req.query.scope || req.body?.scope;
    if (!scope) {
      res.status(400).json({ error: 'Missing scope' });
      return;
    }

    if (scope === 'access') {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const [{ data: profile }, { data: trial }, { data: subscription }, { data: usage }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('app_user_id', session.id).single(),
        supabase.from('user_trials').select('*').eq('app_user_id', session.id).single(),
        supabase.from('user_subscriptions').select('*').eq('app_user_id', session.id).single(),
        supabase.from('generation_usage').select('*').eq('app_user_id', session.id).single(),
      ]);

      const plan = getPlanFromSubscription(subscription);
      const used = usage?.successful_generations || 0;

      res.status(200).json({
        profile,
        trial: getTrialStateFromRow(trial),
        subscription: { ...subscription, plan },
        generationUsage: {
          used,
          remaining: getRemainingGenerations(plan, used),
          limit: PLAN_GENERATION_LIMIT,
        },
      });
      return;
    }

    if (scope === 'profile') {
      if (req.method === 'PATCH') {
        const updates = {};
        if (typeof req.body?.credits === 'number') updates.credits = req.body.credits;
        if (typeof req.body?.full_name === 'string') updates.full_name = req.body.full_name;
        if (typeof req.body?.picture === 'string') updates.picture = req.body.picture;
        if (typeof req.body?.is_admin === 'boolean') updates.is_admin = req.body.is_admin;

        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(data);
        return;
      }

      if (!['GET', 'POST'].includes(req.method)) {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('app_user_id', session.id)
        .single();
      if (error) throw error;
      res.status(200).json(data);
      return;
    }

    if (scope === 'trial') {
      if (req.method === 'PATCH') {
        const updates = {};
        if (typeof req.body?.motion_downloads_used === 'number') {
          updates.motion_downloads_used = Math.max(0, req.body.motion_downloads_used);
        }

        const { data, error } = await supabase
          .from('user_trials')
          .update(updates)
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(getTrialStateFromRow(data));
        return;
      }

      if (req.method === 'POST') {
        const { data: existing, error: existingError } = await supabase
          .from('user_trials')
          .select('*')
          .eq('app_user_id', session.id)
          .single();
        if (existingError) throw existingError;

        const currentTrial = getTrialStateFromRow(existing);
        if (currentTrial.status !== 'none') {
          res.status(200).json(currentTrial);
          return;
        }

        const startedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

        const { data, error } = await supabase
          .from('user_trials')
          .update({ started_at: startedAt, expires_at: expiresAt, motion_downloads_used: 0 })
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(getTrialStateFromRow(data));
        return;
      }

      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { data, error } = await supabase
        .from('user_trials')
        .select('*')
        .eq('app_user_id', session.id)
        .single();
      if (error) throw error;
      res.status(200).json(getTrialStateFromRow(data));
      return;
    }

    if (scope === 'subscription') {
      if (req.method === 'PUT') {
        const updates = {};
        const plan = req.body?.plan;
        if (plan === 'starter' || plan === 'standard' || plan === 'premium' || plan === 'none') {
          updates.plan = plan;
        }
        if (typeof req.body?.status === 'string') updates.status = req.body.status;
        if (typeof req.body?.stripe_customer_id === 'string') updates.stripe_customer_id = req.body.stripe_customer_id;
        if (typeof req.body?.stripe_subscription_id === 'string') updates.stripe_subscription_id = req.body.stripe_subscription_id;
        if (typeof req.body?.stripe_price_id === 'string') updates.stripe_price_id = req.body.stripe_price_id;
        if (typeof req.body?.cancel_at_period_end === 'boolean') updates.cancel_at_period_end = req.body.cancel_at_period_end;
        if (req.body?.current_period_end) updates.current_period_end = req.body.current_period_end;

        const { data, error } = await supabase
          .from('user_subscriptions')
          .update(updates)
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json({ ...data, plan: getPlanFromSubscription(data) });
        return;
      }

      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('app_user_id', session.id)
        .single();
      if (error) throw error;
      res.status(200).json({ ...data, plan: getPlanFromSubscription(data) });
      return;
    }

    if (scope === 'generation') {
      const [{ data: subscription }, { data: usage }] = await Promise.all([
        supabase.from('user_subscriptions').select('*').eq('app_user_id', session.id).single(),
        supabase.from('generation_usage').select('*').eq('app_user_id', session.id).single(),
      ]);

      const plan = getPlanFromSubscription(subscription);
      const currentUsed = usage?.successful_generations || 0;

      if (req.method === 'POST') {
        if (plan !== 'standard' && plan !== 'premium') {
          res.status(200).json({ used: currentUsed, remaining: 0, limit: PLAN_GENERATION_LIMIT });
          return;
        }

        const nextUsed = currentUsed + 1;
        const { data, error } = await supabase
          .from('generation_usage')
          .update({ successful_generations: nextUsed })
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;

        res.status(200).json({
          used: data.successful_generations,
          remaining: getRemainingGenerations(plan, data.successful_generations),
          limit: PLAN_GENERATION_LIMIT,
        });
        return;
      }

      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      res.status(200).json({
        used: currentUsed,
        remaining: getRemainingGenerations(plan, currentUsed),
        limit: PLAN_GENERATION_LIMIT,
      });
      return;
    }

    if (scope === 'projects') {
      if (req.method === 'POST') {
        const { id, name, editor_state, thumbnail } = req.body || {};
        const payload = {
          ...(id ? { id } : {}),
          app_user_id: session.id,
          name: name || 'Untitled Design',
          editor_state: editor_state || {},
          thumbnail: thumbnail || null,
        };

        const { data, error } = await supabase
          .from('projects')
          .upsert(payload, { onConflict: 'id' })
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(data);
        return;
      }

      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('app_user_id', session.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      res.status(200).json(data || []);
      return;
    }

    if (scope === 'project') {
      const projectId = req.method === 'GET' ? req.query.id : req.body?.id;
      if (!projectId) {
        res.status(400).json({ error: 'Missing project id' });
        return;
      }

      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('app_user_id', session.id)
          .single();
        if (error) throw error;
        res.status(200).json(data);
        return;
      }

      if (req.method === 'PATCH') {
        const { name, editor_state, thumbnail } = req.body || {};
        const updates = {};
        if (typeof name === 'string') updates.name = name;
        if (typeof editor_state !== 'undefined') updates.editor_state = editor_state;
        if (typeof thumbnail !== 'undefined') updates.thumbnail = thumbnail;

        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)
          .eq('app_user_id', session.id)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(data);
        return;
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('app_user_id', session.id);
        if (error) throw error;
        res.status(200).json({ success: true });
        return;
      }

      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    if (scope === 'admin') {
      if (!ensureAdmin(session, res)) return;

      const view = req.query.view || req.body?.view || 'users';
      if (req.method === 'GET') {
        if (view === 'stats') {
          const { data: profiles, error } = await supabase.from('user_profiles').select('credits, created_at');
          if (error) throw error;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          res.status(200).json({
            totalUsers: profiles.length,
            totalCredits: profiles.reduce((sum, user) => sum + (user.credits || 0), 0),
            joinsToday: profiles.filter((user) => new Date(user.created_at) >= today).length,
          });
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data || []);
        return;
      }

      const userId = req.body?.userId;
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }

      if (req.method === 'PATCH') {
        const updates = {};
        if (typeof req.body?.credits === 'number') updates.credits = req.body.credits;
        if (typeof req.body?.is_admin === 'boolean') updates.is_admin = req.body.is_admin;

        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('app_user_id', userId)
          .select('*')
          .single();
        if (error) throw error;
        res.status(200).json(data);
        return;
      }

      if (req.method === 'DELETE') {
        const deleteTables = ['projects', 'generation_usage', 'user_trials', 'user_subscriptions', 'user_profiles'];
        for (const table of deleteTables) {
          const { error } = await supabase.from(table).delete().eq('app_user_id', userId);
          if (error) throw error;
        }
        res.status(200).json({ success: true });
        return;
      }

      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    if (scope === 'plan-from-price') {
      res.status(200).json({ plan: mapPriceIdToPlan(req.query.priceId || req.body?.priceId) });
      return;
    }

    res.status(400).json({ error: 'Invalid scope' });
  } catch (error) {
    console.error('Data route error:', error);
    res.status(500).json({ error: error.message || 'Failed to process data request' });
  }
}
