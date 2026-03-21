import { ensureUserRecords, getSupabaseAdmin, requireSession } from './_supabase.js';

export default async function handler(req, res) {
  if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const session = requireSession(req, res);
    if (!session) return;

    const supabase = getSupabaseAdmin();
    await ensureUserRecords(supabase, session);

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

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('app_user_id', session.id);

    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Project route error:', error);
    res.status(500).json({ error: error.message || 'Failed to manage project' });
  }
}
