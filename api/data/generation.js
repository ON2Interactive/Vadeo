import { ensureUserRecords, getPlanFromSubscription, getRemainingGenerations, getSupabaseAdmin, PLAN_GENERATION_LIMIT, requireSession } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

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

    res.status(200).json({
      used: currentUsed,
      remaining: getRemainingGenerations(plan, currentUsed),
      limit: PLAN_GENERATION_LIMIT,
    });
  } catch (error) {
    console.error('Generation route error:', error);
    res.status(500).json({ error: error.message || 'Failed to load generation usage' });
  }
}
