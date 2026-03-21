import Stripe from 'stripe';
import { getBaseUrl, getSessionFromRequest } from '../auth/_utils.js';

const findCustomerIdForSession = async (stripe, session) => {
  const email = String(session?.email || '').trim().toLowerCase();
  if (!email) {
    return null;
  }

  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0]?.id || null;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
      return;
    }

    const session = getSessionFromRequest(req);
    if (!session?.email) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const stripe = new Stripe(stripeSecretKey);
    const customerId = await findCustomerIdForSession(stripe, session);

    if (!customerId) {
      res.status(404).json({ error: 'No Stripe customer found for this account' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/editor`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
  }
}
