import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    avatarUrl: string;
    provider: 'GOOGLE' | 'FACEBOOK';
}

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (token: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: false,

    login: async (token: string) => {
        localStorage.setItem('auth_token', token);
        set({ token, isLoading: true });

        try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                localStorage.removeItem('auth_token');
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            localStorage.removeItem('auth_token');
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadUser: async () => {
        const token = get().token;
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        set({ isLoading: true });
        try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                localStorage.removeItem('auth_token');
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    checkAuth: () => {
        return !!get().token;
    },
}));
