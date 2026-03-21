import { ensureUserRecords, getSupabaseAdmin, requireSession } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

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

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('app_user_id', session.id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: error.message || 'Failed to load profile' });
  }
}
