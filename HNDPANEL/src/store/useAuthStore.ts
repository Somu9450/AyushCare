import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User, UserRole } from '../types/api';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  hospitalId: string | null;
  doctorId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User | null, token?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  role: null,
  hospitalId: null,
  doctorId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user: User | null, token?: string) => {
    if (user) {
      const activeToken = token || Cookies.get('accessToken') || null;
      if (activeToken) {
        Cookies.set('accessToken', activeToken, { expires: 7, sameSite: 'lax' });
      }
      Cookies.set('userRole', user.role, { expires: 7, sameSite: 'lax' });
      set({
        user,
        token: activeToken,
        role: user.role,
        hospitalId: user.hospital_id || null,
        doctorId: user.role === 'doctor' ? user.id : null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      Cookies.remove('accessToken');
      Cookies.remove('userRole');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      set({
        user: null,
        token: null,
        role: null,
        hospitalId: null,
        doctorId: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      const { user, accessToken } = data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }
      get().setUser(user, accessToken);
      return user;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore API logout failures during cleanup
    } finally {
      get().setUser(null);
    }
  },

  hydrate: async () => {
    set({ isLoading: true });
    const token =
      Cookies.get('accessToken') ||
      (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

    if (!token) {
      set({
        user: null,
        token: null,
        role: null,
        hospitalId: null,
        doctorId: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const user = await authService.getMe();
      get().setUser(user, token);
    } catch {
      get().setUser(null);
    }
  },
}));
