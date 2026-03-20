import type { ActivePlan } from './subscriptionStorage';

const GENERATION_USAGE_KEY = 'vadeo_generation_usage';
const INTERNAL_PLAN_GENERATION_LIMIT = 20;

type UsageMap = Record<string, number>;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readUsage = (): UsageMap => {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(GENERATION_USAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to read generation usage:', error);
    return {};
  }
};

const writeUsage = (usage: UsageMap) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(GENERATION_USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to write generation usage:', error);
  }
};

export const getGenerationCountForUser = (userId: string | null | undefined) => {
  if (!userId) return 0;
  return readUsage()[userId] || 0;
};

export const getRemainingGenerations = (userId: string | null | undefined, plan: ActivePlan | null) => {
  if (plan !== 'standard' && plan !== 'premium') return 0;
  return Math.max(0, INTERNAL_PLAN_GENERATION_LIMIT - getGenerationCountForUser(userId));
};

export const canUseGeneration = (userId: string | null | undefined, plan: ActivePlan | null) => {
  if (plan !== 'standard' && plan !== 'premium') return false;
  return getRemainingGenerations(userId, plan) > 0;
};

export const recordGenerationSuccess = (userId: string | null | undefined, plan: ActivePlan | null) => {
  if (!userId || (plan !== 'standard' && plan !== 'premium')) {
    return getRemainingGenerations(userId, plan);
  }

  const usage = readUsage();
  usage[userId] = (usage[userId] || 0) + 1;
  writeUsage(usage);
  return getRemainingGenerations(userId, plan);
};

export const resetGenerationUsageForUser = (userId: string | null | undefined) => {
  if (!userId) return;
  const usage = readUsage();
  delete usage[userId];
  writeUsage(usage);
};

export const PLAN_GENERATION_LIMIT = INTERNAL_PLAN_GENERATION_LIMIT;
