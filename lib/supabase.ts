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
  motionDownloadsUsed?: number;
};

export type UsageState = {
  used: number;
  remaining: number;
  limit: number;
};

export type MotionAiUsageState = UsageState & {
  standardLimit?: number;
  premiumLimit?: number;
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

const buildDataUrl = (scope: string, params?: Record<string, string>) => {
  const target = new URL('/api/data', typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  target.searchParams.set('scope', scope);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      target.searchParams.set(key, value);
    });
  }
  return `${target.pathname}${target.search}`;
};

const buildSession = async () => {
  try {
    return await fetchJson<SessionResponse>('/api/auth/session');
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return { authenticated: false, user: null };
  }
};

const persistEditorMedia = async (editorState: any) => {
  if (!editorState?.pages) return editorState;

  const pages = await Promise.all(
    editorState.pages.map(async (page: any) => {
      const layers = await Promise.all(
        (page.layers || []).map(async (layer: any) => {
          if (layer?.type === 'IMAGE' && typeof layer.src === 'string') {
            return {
              ...layer,
              src: await localMediaStore.persistBlobUrl(layer.src)
            };
          }
          return layer;
        })
      );

      const persistedThumbnail =
        typeof page.thumbnail === 'string'
          ? await localMediaStore.persistBlobUrl(page.thumbnail)
          : page.thumbnail;

      return { ...page, layers, thumbnail: persistedThumbnail };
    })
  );

  return { ...editorState, pages };
};

const sanitizeEditorStateForPersistence = (editorState: any) => {
  if (!editorState?.pages) return editorState;

  return {
    pages: editorState.pages,
    activePageId: editorState.activePageId,
    zoom: editorState.zoom,
    pan: editorState.pan,
    isPro: editorState.isPro
  };
};

const resolveEditorMedia = async (editorState: any) => {
  if (!editorState?.pages) return editorState;

  const pages = await Promise.all(
    editorState.pages.map(async (page: any) => {
      const layers = await Promise.all(
        (page.layers || []).map(async (layer: any) => {
          if (layer?.type === 'IMAGE' && typeof layer.src === 'string' && localMediaStore.isLocalMediaUri(layer.src)) {
            return {
              ...layer,
              src: await localMediaStore.resolveSrc(layer.src)
            };
          }
          return layer;
        })
      );

      const resolvedThumbnail =
        typeof page.thumbnail === 'string' && localMediaStore.isLocalMediaUri(page.thumbnail)
          ? await localMediaStore.resolveSrc(page.thumbnail)
          : page.thumbnail;

      return { ...page, layers, thumbnail: resolvedThumbnail };
    })
  );

  return { ...editorState, pages };
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
      motionAiUsage: MotionAiUsageState;
    }>(buildDataUrl('access'));
  },

  async getUserProfile(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>(buildDataUrl('profile'));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserCredits(userId: string, credits: number) {
    try {
      const data = await fetchJson<any>(buildDataUrl('profile'), {
        method: 'PATCH',
        body: JSON.stringify({ scope: 'profile', credits }),
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
      const data = await fetchJson<any>(buildDataUrl('profile'), {
        method: 'POST',
        body: JSON.stringify({ scope: 'profile' }),
      });
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
      const data = await fetchJson<TrialState>(buildDataUrl('trial'), {
        method: 'POST',
        body: JSON.stringify({ scope: 'trial' }),
      });
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
      const data = await fetchJson<TrialState>(buildDataUrl('trial'));
      return { data, error: null };
    } catch (error) {
      return { data: { status: 'none', startedAt: null, expiresAt: null }, error };
    }
  },

  async updateTrialState(updates: { motionDownloadsUsed?: number }) {
    try {
      const payload: Record<string, unknown> = { scope: 'trial' };
      if (typeof updates.motionDownloadsUsed === 'number') {
        payload.motion_downloads_used = updates.motionDownloadsUsed;
      }

      const data = await fetchJson<TrialState>(buildDataUrl('trial'), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getSubscription(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return { data: null, error: new Error('User is not authenticated') };
    }

    try {
      const data = await fetchJson<any>(buildDataUrl('subscription'));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateSubscription(updates: Record<string, unknown>) {
    try {
      const data = await fetchJson<any>(buildDataUrl('subscription'), {
        method: 'PUT',
        body: JSON.stringify({ scope: 'subscription', ...updates }),
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
      const data = await fetchJson<{ used: number; remaining: number; limit: number }>(buildDataUrl('generation'));
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
      const data = await fetchJson<{ used: number; remaining: number; limit: number }>(buildDataUrl('generation'), {
        method: 'POST',
        body: JSON.stringify({ scope: 'generation' }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: { used: 0, remaining: 0, limit: 20 }, error };
    }
  },

  async getMotionAiUsage(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return {
        data: { used: 0, remaining: 0, limit: 0, standardLimit: 5, premiumLimit: 10 },
        error: new Error('User is not authenticated')
      };
    }

    try {
      const data = await fetchJson<MotionAiUsageState>(buildDataUrl('motion-ai'));
      return { data, error: null };
    } catch (error) {
      return {
        data: { used: 0, remaining: 0, limit: 0, standardLimit: 5, premiumLimit: 10 },
        error
      };
    }
  },

  async recordMotionAiSuccess(userId: string) {
    const session = await buildSession();
    const user = session.user;
    if (!user || user.id !== userId) {
      return {
        data: { used: 0, remaining: 0, limit: 0, standardLimit: 5, premiumLimit: 10 },
        error: new Error('User is not authenticated')
      };
    }

    try {
      const data = await fetchJson<MotionAiUsageState>(buildDataUrl('motion-ai'), {
        method: 'POST',
        body: JSON.stringify({ scope: 'motion-ai' }),
      });
      return { data, error: null };
    } catch (error) {
      return {
        data: { used: 0, remaining: 0, limit: 0, standardLimit: 5, premiumLimit: 10 },
        error
      };
    }
  },

  async getUserProjects(userId: string) {
    const session = await buildSession();
    if (!session.user || session.user.id !== userId) {
      return { data: [], error: null };
    }

    try {
      const data = await fetchJson<any[]>(buildDataUrl('projects'));
      const resolved = await Promise.all(
        data.map(async (project) => ({
          ...project,
          thumbnail:
            typeof project.thumbnail === 'string' && localMediaStore.isLocalMediaUri(project.thumbnail)
              ? await localMediaStore.resolveSrc(project.thumbnail)
              : project.thumbnail,
        }))
      );
      return { data: resolved, error: null };
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
      const persistedEditorState = await persistEditorMedia(
        sanitizeEditorStateForPersistence(editorState)
      );
      const persistedThumbnail = typeof thumbnail === 'string'
        ? await localMediaStore.persistBlobUrl(thumbnail)
        : thumbnail;
      const data = await fetchJson<any>(buildDataUrl('projects'), {
        method: 'POST',
        body: JSON.stringify({
          scope: 'projects',
          name: projectName,
          editor_state: persistedEditorState,
          thumbnail: persistedThumbnail,
        }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProject(projectId: string, projectName: string, editorState: any, thumbnail?: string) {
    try {
      const persistedEditorState = await persistEditorMedia(
        sanitizeEditorStateForPersistence(editorState)
      );
      const persistedThumbnail = typeof thumbnail === 'string'
        ? await localMediaStore.persistBlobUrl(thumbnail)
        : thumbnail;
      const data = await fetchJson<any>(buildDataUrl('project'), {
        method: 'PATCH',
        body: JSON.stringify({
          scope: 'project',
          id: projectId,
          name: projectName,
          editor_state: persistedEditorState,
          thumbnail: persistedThumbnail,
        }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteProject(projectId: string) {
    try {
      await fetchJson(buildDataUrl('project'), {
        method: 'DELETE',
        body: JSON.stringify({ scope: 'project', id: projectId }),
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async getProject(projectId: string) {
    try {
      const data = await fetchJson<any>(buildDataUrl('project', { id: projectId }));
      return {
        data: data
          ? {
              ...data,
              editor_state: await resolveEditorMedia(data.editor_state)
            }
          : data,
        error: null
      };
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
  async hasAdminSession() {
    try {
      const data = await fetchJson<{ authenticated: boolean }>('/api/admin/session');
      return data.authenticated;
    } catch {
      return false;
    }
  },

  async login(email: string, password: string) {
    try {
      const data = await fetchJson<{ ok: boolean }>('/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async logout() {
    try {
      const data = await fetchJson<{ ok: boolean }>('/api/admin/logout', { method: 'POST' });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAllUsers() {
    try {
      const data = await fetchJson<{ users: any[] }>('/api/admin/users?view=users');
      return { data: data.users || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getUserStats() {
    try {
      const data = await fetchJson<any>('/api/admin/users?view=stats');
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserCredits(userId: string, credits: number) {
    return dbHelpers.updateUserCredits(userId, credits);
  },

  async updateUser(userId: string, updates: { full_name?: string; credits?: number; is_admin?: boolean }) {
    try {
      const data = await fetchJson<any>('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ id: userId, ...updates }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteUser(userId: string) {
    try {
      await fetchJson('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id: userId }),
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async toggleAdminStatus(userId: string, isAdmin: boolean) {
    try {
      const data = await fetchJson<any>('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ id: userId, is_admin: isAdmin }),
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
