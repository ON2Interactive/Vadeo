import { STRIPE_CONFIG, type StripePlanId } from '../stripeConfig';

type CheckoutOptions = {
  successPath?: string;
  cancelPath?: string;
};

const getPlanDetails = (planId: StripePlanId) => STRIPE_CONFIG.PLANS[planId];

export const storePendingPurchase = (planId: StripePlanId) => {
  if (typeof window === 'undefined') return;

  const planDetails = getPlanDetails(planId);
  if (!planDetails) return;

  window.localStorage.setItem('pending_purchase', JSON.stringify({
    planId,
    planName: planDetails.name,
    price: planDetails.price,
    billingPeriod: planDetails.billingPeriod,
    includedGenerations: planDetails.includedGenerations,
    resolution: planDetails.resolution,
  }));
};

export const beginStripeCheckout = async (
  planId: StripePlanId,
  options: CheckoutOptions = {},
) => {
  if (typeof window === 'undefined') return;

  storePendingPurchase(planId);

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      planId,
      successPath: options.successPath || '/editor',
      cancelPath: options.cancelPath || '/pricing',
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'Failed to start Stripe checkout');
  }

  window.location.href = payload.url;
};
