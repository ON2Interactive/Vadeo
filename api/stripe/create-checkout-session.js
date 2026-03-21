import Stripe from 'stripe';
import { getBaseUrl, getSessionFromRequest } from '../auth/_utils.js';

const PRICE_IDS = {
  STARTER: 'price_1TDA81PS7A6w1qKNbfSiBBDA',
  PRO: 'price_1TDA9gPS7A6w1qKNjZmhivpd',
  BRAND: 'price_1TDAAfPS7A6w1qKNJmziQDG6',
};

const buildReturnUrl = (baseUrl, path, paymentSuccess = false) => {
  const target = new URL(path || '/pricing', baseUrl);
  if (paymentSuccess) {
    target.searchParams.set('payment', 'success');
    target.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  }
  return target.toString();
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

    const { planId, successPath = '/editor', cancelPath = '/pricing' } = req.body || {};
    const priceId = PRICE_IDS[planId];

    if (!priceId) {
      res.status(400).json({ error: 'Invalid plan selected' });
      return;
    }

    const stripe = new Stripe(stripeSecretKey);
    const baseUrl = getBaseUrl(req);
    const session = getSessionFromRequest(req);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: buildReturnUrl(baseUrl, successPath, true),
      cancel_url: buildReturnUrl(baseUrl, cancelPath, false),
      client_reference_id: session?.id || undefined,
      customer_email: session?.email || undefined,
      metadata: {
        planId,
        priceId,
        userId: session?.id || '',
        userEmail: session?.email || '',
      },
      subscription_data: {
        metadata: {
          planId,
          priceId,
          userId: session?.id || '',
          userEmail: session?.email || '',
        },
      },
    });

    res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
