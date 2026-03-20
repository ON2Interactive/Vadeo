
/**
 * STRIPE CONFIGURATION (No-Server Method)
 * 
 * This method uses "Stripe Payment Links" which requires ZERO backend code.
 */

export const STRIPE_CONFIG = {
  // 1. Create "Payment Links" in your Stripe Dashboard for each tier:
  // Payments > Payment Links > New
  LINKS: {
    STARTER: 'https://buy.stripe.com/aFabJ10jd8Zv04meloe3e00', // $10 for 600 credits
    PRO: 'https://buy.stripe.com/5kQcN5aXR5NjdVcb9ce3e01',     // $25 for 1800 credits
    BRAND: 'https://buy.stripe.com/7sIdR92rl3Fbg3k4gj',        // $50 for 4000 credits
  },

  // 2. Set to 'true' to use the real links, 'false' for the demo simulation.
  IS_LIVE: true
};
