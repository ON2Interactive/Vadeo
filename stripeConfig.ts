
/**
 * STRIPE CONFIGURATION (No-Server Method)
 * 
 * This method uses "Stripe Payment Links" which requires ZERO backend code.
 */

export const STRIPE_CONFIG = {
  // Create subscription payment links in Stripe for each plan, then replace the placeholders below.
  LINKS: {
    STARTER: 'https://buy.stripe.com/aFabJ10jd8Zv04meloe3e00', // Starter subscription
    PRO: 'https://buy.stripe.com/5kQcN5aXR5NjdVcb9ce3e01',     // Standard subscription
    BRAND: 'https://buy.stripe.com/7sIdR92rl3Fbg3k4gj',        // Premium subscription
  },

  // Legacy single-link key used by older upgrade modals. Pointing it at Standard by default.
  PAYMENT_LINK: 'https://buy.stripe.com/5kQcN5aXR5NjdVcb9ce3e01',

  IS_LIVE: true,

  // Plan details used for UI copy and purchase metadata.
  PLANS: {
    STARTER: {
      name: 'Starter',
      price: 19,
      billingPeriod: 'month',
      includedGenerations: 0,
      resolution: 'Workspace only'
    },
    PRO: {
      name: 'Standard',
      price: 79,
      billingPeriod: 'month',
      includedGenerations: 20,
      resolution: '1080p'
    },
    BRAND: {
      name: 'Premium',
      price: 159,
      billingPeriod: 'month',
      includedGenerations: 20,
      resolution: '4K'
    }
  }
};
