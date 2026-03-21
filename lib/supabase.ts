import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

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
  async getAccessState() {
    return fetchJson<{
      profile: any;
      trial: TrialState;
      subscription: any;
      generationUsage: { used: number; remaining: number; limit: number };
    }>('/api/data/access');
  },

  async getUserProfile(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>('/api/data/profile');
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserCredits(userId: string, credits: number) {
    try {
      const data = await fetchJson<any>('/api/data/profile', {
        method: 'PATCH',
        body: JSON.stringify({ credits }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async initUserProfile(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>('/api/data/profile', { method: 'POST' });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async startFreeTrial(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<TrialState>('/api/data/trial', { method: 'POST' });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getTrialState(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: { status: 'none', startedAt: null, expiresAt: null }, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<TrialState>('/api/data/trial');
      return { data, error: null };
    } catch (error) {
      return { data: { status: 'none', startedAt: null, expiresAt: null }, error };
    }
  },

  async getSubscription(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>('/api/data/subscription');
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateSubscription(updates: Record<string, unknown>) {
    try {
      const data = await fetchJson<any>('/api/data/subscription', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getGenerationUsage(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: { used: 0, remaining: 0, limit: 20 }, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<{ used: number; remaining: number; limit: number }>('/api/data/generation');
      return { data, error: null };
    } catch (error) {
      return { data: { used: 0, remaining: 0, limit: 20 }, error };
    }
  },

  async recordGenerationSuccess(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: { used: 0, remaining: 0, limit: 20 }, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<{ used: number; remaining: number; limit: number }>('/api/data/generation', {
        method: 'POST',
      });
      return { data, error: null };
    } catch (error) {
      return { data: { used: 0, remaining: 0, limit: 20 }, error };
    }
  },

  async getUserProjects(userId: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) {
      return { data: [], error: null };
    }

    try {
      const data = await fetchJson<any[]>('/api/data/projects');
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async saveProject(userId: string, projectName: string, editorState: any, thumbnail?: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>('/api/data/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          editor_state: editorState,
          thumbnail,
        }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProject(projectId: string, projectName: string, editorState: any, thumbnail?: string) {
    try {
      const data = await fetchJson<any>('/api/data/project', {
        method: 'PATCH',
        body: JSON.stringify({
          id: projectId,
          name: projectName,
          editor_state: editorState,
          thumbnail,
        }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteProject(projectId: string) {
    try {
      await fetchJson('/api/data/project', {
        method: 'DELETE',
        body: JSON.stringify({ id: projectId }),
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getProject(projectId: string) {
    try {
      const query = new URLSearchParams({ id: projectId }).toString();
      const data = await fetchJson<any>(`/api/data/project?${query}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
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
    try {
      const data = await fetchJson<any[]>('/api/data/admin?view=users');
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getUserStats() {
    try {
      const data = await fetchJson<any>('/api/data/admin?view=stats');
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserCredits(userId: string, credits: number) {
    return dbHelpers.updateUserCredits(userId, credits);
  },

  async deleteUser(userId: string) {
    try {
      await fetchJson('/api/data/admin', {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async toggleAdminStatus(userId: string, isAdmin: boolean) {
    try {
      const data = await fetchJson<any>('/api/data/admin', {
        method: 'PATCH',
        body: JSON.stringify({ userId, is_admin: isAdmin }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async isUserAdmin(userId: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) return false;

    return Boolean(session.user.is_admin);
  },
};
