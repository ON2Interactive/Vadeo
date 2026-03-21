import { localProjectStore } from './localProjects';
import { localMediaStore } from './localMedia';

type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  picture?: string;
  is_admin?: boolean;
};

type SessionResponse = {
  authenticated: boolean;
  user: AuthUser | null;
};

export type TrialStatus = 'none' | 'active' | 'expired';

export type TrialState = {
  status: TrialStatus;
  startedAt: string | null;
  expiresAt: string | null;
};

const PROFILE_STORAGE_KEY = 'vadeo_user_profiles';
const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readProfiles = (): Record<string, any> => {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to read local profiles:', error);
    return {};
  }
};

const writeProfiles = (profiles: Record<string, any>) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to write local profiles:', error);
  }
};

const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload as T;
};

const getStoredProfile = (user: AuthUser | null) => {
  if (!user) return null;
  const profiles = readProfiles();
  return profiles[user.id] || null;
};

const ensureStoredProfile = (user: AuthUser) => {
  const profiles = readProfiles();
  if (!profiles[user.id]) {
    profiles[user.id] = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.email.split('@')[0],
      credits: 50,
      is_admin: Boolean(user.is_admin),
      trial_started_at: null,
      trial_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeProfiles(profiles);
  } else {
    profiles[user.id] = {
      ...profiles[user.id],
      email: user.email,
      full_name: user.full_name || profiles[user.id].full_name,
      is_admin: Boolean(user.is_admin),
      updated_at: new Date().toISOString(),
    };
    writeProfiles(profiles);
  }
  return profiles[user.id];
};

const computeTrialState = (profile: any): TrialState => {
  const startedAt = profile?.trial_started_at || null;
  const expiresAt = profile?.trial_expires_at || null;

  if (!startedAt || !expiresAt) {
    return { status: 'none', startedAt: null, expiresAt: null };
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return { status: 'none', startedAt: null, expiresAt: null };
  }

  return {
    status: expiresAtMs > Date.now() ? 'active' : 'expired',
    startedAt,
    expiresAt,
  };
};

const buildSession = async () => {
  try {
    return await fetchJson<SessionResponse>('/api/auth/session');
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return { authenticated: false, user: null };
  }
};

const redirectToGoogle = (redirectPath = '/editor') => {
  if (typeof window === 'undefined') return;

  const target = new URL('/api/auth/google/start', window.location.origin);
  target.searchParams.set('redirect', redirectPath);
  window.location.href = target.toString();
};

export const supabase = null;

export const authHelpers = {
  async signUp() {
    redirectToGoogle('/editor');
    return { data: null, error: null };
  },

  async signIn() {
    redirectToGoogle('/editor');
    return { data: null, error: null };
  },

  async signInWithGoogle(redirectPath = '/editor') {
    redirectToGoogle(redirectPath);
  },

  async signOut() {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getCurrentUser() {
    const session = await buildSession();
    return session.user;
  },

  async getSession() {
    const session = await buildSession();
    if (!session.user) return null;

    return {
      user: session.user,
    };
  },
};

export const dbHelpers = {
  async getUserProfile(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    const profile = ensureStoredProfile(user);
    return { data: profile, error: null };
  },

  async updateUserCredits(userId: string, credits: number) {
    const profiles = readProfiles();
    const existing = profiles[userId];
    if (!existing) {
      return { data: null, error: new Error('Profile not found') };
    }

    profiles[userId] = {
      ...existing,
      credits,
      updated_at: new Date().toISOString(),
    };
    writeProfiles(profiles);
    return { data: profiles[userId], error: null };
  },

  async initUserProfile(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    const profile = ensureStoredProfile(user);
    return { data: profile, error: null };
  },

  async startFreeTrial(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    const profiles = readProfiles();
    const existing = ensureStoredProfile(user);
    const currentTrial = computeTrialState(existing);

    if (currentTrial.status !== 'none') {
      return { data: currentTrial, error: null };
    }

    const startedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

    profiles[userId] = {
      ...existing,
      trial_started_at: startedAt,
      trial_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    };
    writeProfiles(profiles);

    return {
      data: {
        status: 'active' as TrialStatus,
        startedAt,
        expiresAt,
      },
      error: null,
    };
  },

  async getTrialState(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: { status: 'none', startedAt: null, expiresAt: null }, error: new Error('User is not authenticated') };
    }

    const profile = ensureStoredProfile(user);
    return { data: computeTrialState(profile), error: null };
  },

  async getUserProjects(userId: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) {
      return { data: [], error: null };
    }

    const data = localProjectStore.list();
    return { data, error: null };
  },

  async saveProject(userId: string, projectName: string, editorState: any, thumbnail?: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    const id = crypto.randomUUID();
    const data = await localProjectStore.save({
      id,
      name: projectName,
      editorState,
      thumbnail,
    });
    return { data, error: null };
  },

  async updateProject(projectId: string, projectName: string, editorState: any, thumbnail?: string) {
    const data = await localProjectStore.save({
      id: projectId,
      name: projectName,
      editorState,
      thumbnail,
    });
    return { data, error: null };
  },

  async deleteProject(projectId: string) {
    localProjectStore.delete(projectId);
    return { error: null };
  },

  async getProject(projectId: string) {
    const data = await localProjectStore.get(projectId);
    return { data, error: null };
  },

  async sendEmail(payload: { to: string, subject: string, message: string, type: 'contact' | 'signup' | 'purchase' }) {
    return fetchJson('/api/send-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const storageHelpers = {
  async uploadVideo(_userId: string, file: File, projectId: string) {
    try {
      const objectUrl = URL.createObjectURL(file);
      const persistedUrl = await localMediaStore.persistBlobUrl(objectUrl);
      URL.revokeObjectURL(objectUrl);

      return {
        data: {
          path: `${projectId}/${file.name}`,
          url: persistedUrl,
        },
        error: null,
      };
    } catch (error) {
      console.error('Local video persistence failed:', error);
      return { data: null, error };
    }
  },

  async deleteVideo(_filePath: string) {
    return { error: null };
  },

  getPublicUrl(filePath: string) {
    return filePath;
  }
};

export const adminHelpers = {
  async getAllUsers() {
    const profiles = Object.values(readProfiles());
    return { data: profiles, error: null };
  },

  async getUserStats() {
    const users: any[] = Object.values(readProfiles());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      data: {
        totalUsers: users.length,
        totalCredits: users.reduce((sum, user) => sum + (user.credits || 0), 0),
        joinsToday: users.filter((user) => new Date(user.created_at) >= today).length,
      },
      error: null,
    };
  },

  async updateUserCredits(userId: string, credits: number) {
    return dbHelpers.updateUserCredits(userId, credits);
  },

  async deleteUser(userId: string) {
    const profiles = readProfiles();
    delete profiles[userId];
    writeProfiles(profiles);
    return { error: null };
  },

  async toggleAdminStatus(userId: string, isAdmin: boolean) {
    const profiles = readProfiles();
    const existing = profiles[userId];
    if (!existing) {
      return { data: null, error: new Error('Profile not found') };
    }

    profiles[userId] = {
      ...existing,
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    };
    writeProfiles(profiles);
    return { data: profiles[userId], error: null };
  },

  async isUserAdmin(userId: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) return false;

    const profile = getStoredProfile(session.user);
    return Boolean(session.user.is_admin || profile?.is_admin);
  },
};
