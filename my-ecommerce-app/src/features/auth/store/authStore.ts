import { create } from 'zustand';

// Thông tin đầy đủ của user (lấy từ /auth/me)
export interface UserProfile {
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

interface AuthState {
  accessToken: string | null;
  username: string | null;
  profile: UserProfile | null;  // Thông tin đầy đủ
  isAuthenticated: boolean;
  
  login: (accessToken: string, username: string) => void;
  setProfile: (profile: UserProfile) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  username: localStorage.getItem('username'),
  profile: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (accessToken, username) => {
    localStorage.setItem('username', username);
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, username, isAuthenticated: true });
  },

  setProfile: (profile) => {
    // Cập nhật thêm username từ profile nếu chưa có
    localStorage.setItem('username', profile.username ?? '');
    set({ profile, username: profile.username ?? null });
  },

  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem('username');
    localStorage.removeItem('accessToken');
    set({ accessToken: null, username: null, profile: null, isAuthenticated: false });
  },
}));