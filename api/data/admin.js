import { ensureUserRecords, getSupabaseAdmin, requireSession } from './_supabase.js';

const ensureAdmin = (session, res) => {
  if (!session?.is_admin) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
};

export default async function handler(req, res) {
  if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;
    if (!ensureAdmin(session, res)) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

    if (req.method === 'GET') {
      const { view = 'users' } = req.query;

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

    const deleteTables = ['projects', 'generation_usage', 'user_trials', 'user_subscriptions', 'user_profiles'];
    for (const table of deleteTables) {
      const column = table === 'projects' ? 'app_user_id' : 'app_user_id';
      const { error } = await supabase.from(table).delete().eq(column, userId);
      if (error) throw error;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Admin route error:', error);
    res.status(500).json({ error: error.message || 'Failed to manage admin data' });
  }
}
