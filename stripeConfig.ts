
export type StripePlanId = 'STARTER' | 'PRO' | 'BRAND';

export const STRIPE_CONFIG = {
  PRICE_IDS: {
    STARTER: 'price_1TDA81PS7A6w1qKNbfSiBBDA',
    PRO: 'price_1TDA9gPS7A6w1qKNjZmhivpd',
    BRAND: 'price_1TDAAfPS7A6w1qKNJmziQDG6',
  },

  PRODUCT_IDS: {
    STARTER: 'prod_UBXCzARw94usRG',
    PRO: 'prod_UBXEMlptPNWI6n',
    BRAND: 'prod_UBXFFwaS1pbJdP',
  },

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
