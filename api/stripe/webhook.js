import Stripe from 'stripe';
import { getSupabaseAdmin, mapPriceIdToPlan } from '../data/_supabase.js';

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const getSubscriptionPlan = (subscription) => {
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  return mapPriceIdToPlan(priceId) || 'unknown';
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const getNotifyEmail = () =>
  normalizeEmail(
    process.env.SIGNUP_NOTIFY_EMAIL ||
    process.env.SENDGRID_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    process.env.SENDGRID_FROM_EMAIL ||
    'hello@vadeo.cloud',
  );

const getFromEmail = () =>
  normalizeEmail(process.env.SENDGRID_FROM_EMAIL || 'hello@vadeo.cloud');

const sendNotificationEmail = async ({
  apiKey,
  fromEmail,
  toEmail,
  subject,
  htmlBody,
  textBody,
}) => {
  if (!apiKey || !fromEmail || !toEmail) return;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }], subject }],
      from: { email: fromEmail, name: 'Vadeo' },
      content: [
        { type: 'text/plain', value: textBody },
        { type: 'text/html', value: htmlBody },
      ],
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(`SendGrid notification failed: ${JSON.stringify(payload)}`);
  }
};

const notifyPurchase = async ({ stripeApiKey, session }) => {
  const userEmail =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.userEmail ||
    'unknown';
  const planId = session.metadata?.planId || 'unknown';
  const subject = 'Vadeo: New subscription purchase';

  await sendNotificationEmail({
    apiKey: stripeApiKey,
    fromEmail: getFromEmail(),
    toEmail: getNotifyEmail(),
    subject,
    textBody: [
      'New Vadeo subscription purchase',
      '',
      `Email: ${userEmail}`,
      `Plan: ${planId}`,
      `Checkout Session: ${session.id}`,
      `Subscription: ${session.subscription || 'n/a'}`,
    ].join('\n'),
    htmlBody: `
      <h3>New Vadeo subscription purchase</h3>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Plan:</strong> ${planId}</p>
      <p><strong>Checkout Session:</strong> ${session.id}</p>
      <p><strong>Subscription:</strong> ${session.subscription || 'n/a'}</p>
    `,
  });
};

const notifyCancellationRequested = async ({ stripeApiKey, subscription }) => {
  const subject = 'Vadeo: Subscription cancellation scheduled';
  const plan = getSubscriptionPlan(subscription);
  const userEmail = subscription.metadata?.userEmail || 'unknown';

  await sendNotificationEmail({
    apiKey: stripeApiKey,
    fromEmail: getFromEmail(),
    toEmail: getNotifyEmail(),
    subject,
    textBody: [
      'A Vadeo subscription was set to cancel at period end.',
      '',
      `Email: ${userEmail}`,
      `Plan: ${plan}`,
      `Subscription: ${subscription.id}`,
    ].join('\n'),
    htmlBody: `
      <h3>Vadeo cancellation scheduled</h3>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Subscription:</strong> ${subscription.id}</p>
    `,
  });
};

const notifyCancellationComplete = async ({ stripeApiKey, subscription }) => {
  const subject = 'Vadeo: Subscription cancelled';
  const plan = getSubscriptionPlan(subscription);
  const userEmail = subscription.metadata?.userEmail || 'unknown';

  await sendNotificationEmail({
    apiKey: stripeApiKey,
    fromEmail: getFromEmail(),
    toEmail: getNotifyEmail(),
    subject,
    textBody: [
      'A Vadeo subscription was cancelled.',
      '',
      `Email: ${userEmail}`,
      `Plan: ${plan}`,
      `Subscription: ${subscription.id}`,
    ].join('\n'),
    htmlBody: `
      <h3>Vadeo subscription cancelled</h3>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Subscription:</strong> ${subscription.id}</p>
    `,
  });
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

const resolveUserIdForEvent = async (supabase, payload) => {
  const metadataUserId = payload?.metadata?.userId;
  if (metadataUserId) return metadataUserId;

  const email =
    payload?.customer_details?.email ||
    payload?.customer_email ||
    payload?.metadata?.userEmail ||
    payload?.customer_email ||
    null;

  if (!email) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('app_user_id')
    .eq('email', email)
    .maybeSingle();

  return data?.app_user_id || null;
};

const syncCheckoutSessionToSupabase = async (supabase, session) => {
  const userId = await resolveUserIdForEvent(supabase, session);
  if (!userId) return;

  const plan = mapPriceIdToPlan(session.metadata?.priceId) || (
    session.metadata?.planId === 'STARTER' ? 'starter' :
    session.metadata?.planId === 'PRO' ? 'standard' :
    session.metadata?.planId === 'BRAND' ? 'premium' :
    null
  );

  await supabase.from('user_profiles').upsert({
    app_user_id: userId,
    email: session.customer_details?.email || session.customer_email || session.metadata?.userEmail || '',
    stripe_customer_id: session.customer || null,
  }, { onConflict: 'app_user_id' });

  if (!plan) return;

  await supabase.from('user_subscriptions').upsert({
    app_user_id: userId,
    plan,
    status: 'active',
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
  }, { onConflict: 'app_user_id' });
};

const syncSubscriptionToSupabase = async (supabase, subscription) => {
  const userId = await resolveUserIdForEvent(supabase, subscription);
  if (!userId) return;

  const priceId = subscription?.items?.data?.[0]?.price?.id || null;
  const plan = mapPriceIdToPlan(priceId) || 'none';
  const currentPeriodEndUnix = subscription.items?.data?.[0]?.current_period_end || null;
  const currentPeriodEnd = currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000).toISOString() : null;

  await supabase.from('user_subscriptions').upsert({
    app_user_id: userId,
    plan,
    status: subscription.status || 'inactive',
    stripe_customer_id: subscription.customer || null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_end: currentPeriodEnd,
  }, { onConflict: 'app_user_id' });

  if (subscription.customer) {
    await supabase
      .from('user_profiles')
      .update({ stripe_customer_id: subscription.customer })
      .eq('app_user_id', userId);
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
    const supabase = getSupabaseAdmin();

    const summary = summarizeEvent(event);
    console.log('Stripe webhook received:', JSON.stringify(summary));

    if (event.type === 'checkout.session.completed') {
      await syncCheckoutSessionToSupabase(supabase, event.data.object);
      await notifyPurchase({ stripeApiKey: process.env.SENDGRID_API_KEY, session: event.data.object });
    }

    if (event.type === 'customer.subscription.created') {
      await syncSubscriptionToSupabase(supabase, event.data.object);
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      await syncSubscriptionToSupabase(supabase, subscription);
      const previous = event.data.previous_attributes || {};
      const justScheduledCancellation =
        subscription.cancel_at_period_end === true &&
        previous.cancel_at_period_end !== true;

      if (justScheduledCancellation) {
        await notifyCancellationRequested({
          stripeApiKey: process.env.SENDGRID_API_KEY,
          subscription,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      await syncSubscriptionToSupabase(supabase, event.data.object);
      await notifyCancellationComplete({
        stripeApiKey: process.env.SENDGRID_API_KEY,
        subscription: event.data.object,
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message || 'Webhook processing failed' });
  }
}
