import {
  ensureUserRecords,
  getPlanFromSubscription,
  getRemainingGenerations,
  getSupabaseAdmin,
  getTrialStateFromRow,
  requireSession,
} from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

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
      subscription: {
        ...subscription,
        plan,
      },
      generationUsage: {
        used,
        remaining: getRemainingGenerations(plan, used),
      },
    });
  } catch (error) {
    console.error('Access bootstrap error:', error);
    res.status(500).json({ error: error.message || 'Failed to load access state' });
  }
}
