import { deleteAdminUser, getAdminStats, listAdminUsers, requireAdminSession, updateAdminUser } from './_utils.js';

export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) return;

  try {
    if (req.method === 'GET') {
      const view = req.query.view || 'users';
      if (view === 'stats') {
        res.status(200).json(await getAdminStats());
        return;
      }
      res.status(200).json({ users: await listAdminUsers() });
      return;
    }

    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const id = String(body?.id || body?.userId || '');
    if (!id) {
      res.status(400).json({ error: 'User id is required.' });
      return;
    }

    if (req.method === 'PUT') {
      await updateAdminUser(id, body);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      await deleteAdminUser(id);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Admin request failed.' });
  }
}
