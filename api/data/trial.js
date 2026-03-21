import { ensureUserRecords, getSupabaseAdmin, getTrialStateFromRow, requireSession, TRIAL_DURATION_MS } from './_supabase.js';

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
        .update({ started_at: startedAt, expires_at: expiresAt })
        .eq('app_user_id', session.id)
        .select('*')
        .single();

      if (error) throw error;
      res.status(200).json(getTrialStateFromRow(data));
      return;
    }

    const { data, error } = await supabase
      .from('user_trials')
      .select('*')
      .eq('app_user_id', session.id)
      .single();

    if (error) throw error;
    res.status(200).json(getTrialStateFromRow(data));
  } catch (error) {
    console.error('Trial route error:', error);
    res.status(500).json({ error: error.message || 'Failed to load trial state' });
  }
}
