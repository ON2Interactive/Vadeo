import {
  clearAdminSessionCookie,
  deleteAdminUser,
  getAdminStats,
  hasValidAdminSession,
  isValidAdminLogin,
  listAdminUsers,
  requireAdminSession,
  setAdminSessionCookie,
  updateAdminUser,
} from '../lib/server/adminSession.js';

const parseBody = (req) => (typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'));

const getAction = (req, body) => {
  if (typeof req.query?.action === 'string' && req.query.action) return req.query.action;
  if (typeof body?.action === 'string' && body.action) return body.action;
  return '';
};

export default async function handler(req, res) {
  try {
    const body = ['POST', 'PUT', 'DELETE'].includes(req.method || '') ? parseBody(req) : {};
    const action = getAction(req, body);

    if (req.method === 'GET' && action === 'session') {
      res.status(200).json({ authenticated: hasValidAdminSession(req) });
      return;
    }

    if (req.method === 'POST' && action === 'login') {
      const email = String(body?.email || '');
      const password = String(body?.password || '');

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      if (!isValidAdminLogin(email, password)) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      setAdminSessionCookie(res);
      res.status(200).json({ ok: true });
      return;
    }

    if ((req.method === 'POST' || req.method === 'GET') && action === 'logout') {
      clearAdminSessionCookie(res);
      if (req.method === 'GET') {
        res.writeHead(302, { Location: '/admin-login' });
        res.end();
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (!requireAdminSession(req, res)) return;

    if (req.method === 'GET') {
      const view = req.query.view || 'users';
      if (view === 'stats') {
        res.status(200).json(await getAdminStats());
        return;
      }
      res.status(200).json({ users: await listAdminUsers() });
      return;
    }

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
