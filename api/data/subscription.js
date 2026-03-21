import { ensureUserRecords, getPlanFromSubscription, getSupabaseAdmin, requireSession } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

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

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('app_user_id', session.id)
      .single();

    if (error) throw error;
    res.status(200).json({ ...data, plan: getPlanFromSubscription(data) });
  } catch (error) {
    console.error('Subscription route error:', error);
    res.status(500).json({ error: error.message || 'Failed to load subscription' });
  }
}
