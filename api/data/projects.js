import { ensureUserRecords, getSupabaseAdmin, requireSession } from './_supabase.js';

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

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('app_user_id', session.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    console.error('Projects route error:', error);
    res.status(500).json({ error: error.message || 'Failed to load projects' });
  }
}
