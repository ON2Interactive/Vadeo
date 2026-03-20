import Stripe from 'stripe';

const PRICE_ID_TO_PLAN = {
  price_1TDA81PS7A6w1qKNbfSiBBDA: 'starter',
  price_1TDA9gPS7A6w1qKNjZmhivpd: 'standard',
  price_1TDAAfPS7A6w1qKNJmziQDG6: 'premium',
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const getSubscriptionPlan = (subscription) => {
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  return PRICE_ID_TO_PLAN[priceId] || 'unknown';
};

const summarizeEvent = (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      return {
        type: event.type,
        checkoutSessionId: session.id,
        customerId: session.customer,
        customerEmail: session.customer_details?.email || session.customer_email || session.metadata?.userEmail || null,
        planId: session.metadata?.planId || null,
        userId: session.metadata?.userId || null,
        subscriptionId: session.subscription || null,
      };
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      return {
        type: event.type,
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        plan: getSubscriptionPlan(subscription),
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        currentPeriodEnd: subscription.items?.data?.[0]?.current_period_end || null,
        userId: subscription.metadata?.userId || null,
        userEmail: subscription.metadata?.userEmail || null,
      };
    }
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      return {
        type: event.type,
        invoiceId: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription || null,
        status: invoice.status,
        customerEmail: invoice.customer_email || null,
      };
    }
    default:
      return { type: event.type };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
      return;
    }

    if (!webhookSecret) {
      res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' });
      return;
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      res.status(400).json({ error: 'Missing Stripe signature' });
      return;
    }

    const stripe = new Stripe(stripeSecretKey);
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    const summary = summarizeEvent(event);
    console.log('Stripe webhook received:', JSON.stringify(summary));

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message || 'Webhook processing failed' });
  }
}
