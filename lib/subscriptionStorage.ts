export type ActivePlan = 'starter' | 'standard' | 'premium';

const PLAN_STORAGE_KEY = 'vadeo_user_plans';
const ACTIVE_PLAN_KEY = 'vd_plan';
const LEGACY_PRO_KEY = 'vd_pro_status';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readPlanMap = (): Record<string, ActivePlan> => {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to read subscription storage:', error);
    return {};
  }
};

const writePlanMap = (plans: Record<string, ActivePlan>) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Failed to write subscription storage:', error);
  }
};

export const getStoredPlanForUser = (userId: string | null | undefined): ActivePlan | null => {
  if (!userId) return null;
  const plan = readPlanMap()[userId];
  return plan === 'starter' || plan === 'standard' || plan === 'premium' ? plan : null;
};

export const setStoredPlanForUser = (userId: string, plan: ActivePlan) => {
  const plans = readPlanMap();
  plans[userId] = plan;
  writePlanMap(plans);
};

export const clearActivePlan = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACTIVE_PLAN_KEY);
  window.localStorage.removeItem(LEGACY_PRO_KEY);
};

export const applyActivePlan = (plan: ActivePlan | null) => {
  if (!canUseStorage()) return;

  if (!plan) {
    clearActivePlan();
    return;
  }

  window.localStorage.setItem(ACTIVE_PLAN_KEY, plan);
  window.localStorage.setItem(LEGACY_PRO_KEY, plan === 'premium' ? 'true' : 'false');
};

export const hasStoredSubscription = (userId: string | null | undefined) => Boolean(getStoredPlanForUser(userId));
