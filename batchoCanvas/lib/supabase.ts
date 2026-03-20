import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authHelpers = {
    async signUp(email: string, password: string, fullName: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { data, error };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },
};

// Database helper functions
export const dbHelpers = {
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    async updateUserCredits(userId: string, credits: number) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ credits, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    },

    async initUserProfile(userId: string) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (existingProfile) {
            return { data: existingProfile, error: null };
        }

        // Create new profile with 50 free credits
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                credits: 50,
                is_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error in initUserProfile:', error);
        }

        return { data, error };
    },

    async getUserProjects(userId: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        return { data, error };
    },

    async saveProject(userId: string, projectName: string, editorState: any, thumbnail?: string) {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name: projectName,
                editor_state: editorState,
                thumbnail,
            })
            .select()
            .single();
        return { data, error };
    },

    async updateProject(projectId: string, projectName: string, editorState: any, thumbnail?: string) {
        const { data, error } = await supabase
            .from('projects')
            .update({
                name: projectName,
                editor_state: editorState,
                thumbnail,
                updated_at: new Date().toISOString(),
            })
            .eq('id', projectId)
            .select()
            .single();
        return { data, error };
    },

    async deleteProject(projectId: string) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);
        return { error };
    },

    async getProject(projectId: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
        return { data, error };
    },

    async sendEmail(payload: { to: string, subject: string, message: string, type: 'contact' | 'signup' | 'purchase' }) {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to send email' }));
            console.error('Email API Error:', error);
            throw new Error(error.message || 'Failed to send email');
        }

        return response.json();
    },
};

// Storage helper functions
export const storageHelpers = {
    async uploadVideo(userId: string, file: File, projectId: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${projectId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('project-media')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            return { data: null, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('project-media')
            .getPublicUrl(fileName);

        return { data: { path: fileName, url: publicUrl }, error: null };
    },

    async deleteVideo(filePath: string) {
        const { error } = await supabase.storage
            .from('project-media')
            .remove([filePath]);

        return { error };
    },

    getPublicUrl(filePath: string) {
        const { data } = supabase.storage
            .from('project-media')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};

// Admin helper functions
export const adminHelpers = {
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async getUserStats() {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('credits, created_at');

        if (error) return { data: null, error };

        const totalUsers = users?.length || 0;
        const totalCredits = users?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0;

        // Count users who joined today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const joinsToday = users?.filter(user => {
            const createdDate = new Date(user.created_at);
            return createdDate >= today;
        }).length || 0;

        return {
            data: {
                totalUsers,
                totalCredits,
                joinsToday,
            },
            error: null,
        };
    },

    async updateUserCredits(userId: string, credits: number) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ credits, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    },

    async deleteUser(userId: string) {
        // Use RPC to bypass RLS issues for admin deletes
        const { error } = await supabase.rpc('admin_delete_user', {
            target_user_id: userId
        });

        if (error) {
            console.error("RPC Delete failed:", error);
        }
        return { error };
    },

    async toggleAdminStatus(userId: string, isAdmin: boolean) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    },

    async isUserAdmin(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (error) return false;
        return data?.is_admin || false;
    },
};
