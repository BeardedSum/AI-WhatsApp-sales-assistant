/**
 * Authentication Store - Zustand
 * Manages authentication state and user session
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { AuthState, Business } from '../types';

interface AuthStoreState extends AuthState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuth: (token: string, refreshToken: string, business: Business) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      business: null,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setAuth: (token, refreshToken, business) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          isAuthenticated: true,
          token,
          refreshToken,
          business,
          error: null,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          business: null,
          error: null,
        });
      },

      login: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login({ phone_number: phone, password });

          if (response.success) {
            const { token, refreshToken, business } = response.data;
            get().setAuth(token, refreshToken, business);
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to login';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().clearAuth();
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // The API service handles token refresh automatically
          // This is just a manual trigger if needed
          const response = await api.getMe();

          if (response.success && response.data.business) {
            set({ business: response.data.business });
          }
        } catch (error) {
          get().clearAuth();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        business: state.business,
      }),
    }
  )
);
