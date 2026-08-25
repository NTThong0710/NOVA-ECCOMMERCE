import { useEffect } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useServices } from './useServices';

/**
 * Hook khởi tạo auth — gọi /auth/me nếu có accessToken nhưng profile chưa được load.
 * Thường được dùng ở App.tsx để reload profile sau khi refresh trang.
 */
export function useInitAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const logout = useAuthStore((s) => s.logout);
  const { authService } = useServices();

  useEffect(() => {
    if (accessToken && !profile) {
      authService.getMe()
        .then((res: any) => {
          const data = res?.data || res;
          if (data && data.username) {
            setProfile(data);
          }
        })
        .catch(() => {
          // Token hết hạn hoặc không hợp lệ → đăng xuất
          logout();
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);
}
