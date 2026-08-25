import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OrderHistoryPage from '../../features/orders/pages/OrderHistoryPage';
import { useServices } from '../../hook/useServices';
import toast from 'react-hot-toast';

interface Session {
  deviceId: string;
  deviceName: string;
  location?: string;
  lastActive?: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'orders'>('profile');
  const [profile, setProfile] = useState({ username: '', email: '', phone: '' });
  
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Session states
  const [sessions, setSessions] = useState<Session[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const { userService, authService } = useServices();

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile({ username: data.username, email: data.email || data.username, phone: data.phone || '' });
      } catch (error) {
        setProfile({
            username: localStorage.getItem('username') || 'User',
            email: 'user@example.com',
            phone: '0123456789'
        });
      }
    };
    fetchProfile();
  }, [userService]);

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      const response = await authService.getSessions();
      const sessionList: Session[] = response.map((session: any) => {
        let formattedTime = session.loginTime;
        if (formattedTime) {
          const dateObj = new Date(formattedTime);
          if (!isNaN(dateObj.getTime())) {
            formattedTime = dateObj.toLocaleString();
          }
        }
        return {
          deviceId: session.id || session.deviceId,
          deviceName: session.deviceName || 'Thiết bị không xác định',
          location: session.location || 'Localhost (Mạng nội bộ)',
          lastActive: formattedTime || 'Vừa xong'
        };
      });
      setSessions(sessionList);
    } catch (error) {
      toast.error(t('common.error', 'Không thể lấy thông tin phiên đăng nhập'));
    }
  };

  const handleRevokeSession = async (deviceId: string) => {
    try {
      await authService.revokeSession(deviceId);
      toast.success(t('common.success', 'Đã đăng xuất thiết bị thành công!'));
      fetchSessions();
    } catch (error) {
      toast.error(t('common.error', 'Lỗi khi đăng xuất thiết bị'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userService.updateProfile({
        phone: profile.phone
      });
      toast.success(t('profile.update_success', 'Cập nhật thông tin thành công!'));
    } catch (err: any) {
      toast.error(t('common.error', 'Cập nhật thông tin thất bại!'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.register.error_mismatch', 'Mật khẩu xác nhận không khớp!'));
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success(t('common.success', 'Đổi mật khẩu thành công!'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errData = err.response?.data;
      toast.error(typeof errData === 'string' ? errData : (errData?.message || t('common.error', 'Đổi mật khẩu thất bại!')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          className={`flex-1 min-w-[120px] py-4 text-center font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'profile'
              ? 'text-[#785A46] border-b-2 border-[#785A46]'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="pi pi-user mr-2"></i> {t('profile.personal_info', 'Hồ sơ cá nhân')}
        </button>
        <button
          className={`flex-1 min-w-[120px] py-4 text-center font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'orders'
              ? 'text-[#785A46] border-b-2 border-[#785A46]'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="pi pi-shopping-bag mr-2"></i> {t('profile.my_orders', 'Đơn hàng của tôi')}
        </button>
        <button
          className={`flex-1 min-w-[120px] py-4 text-center font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'security'
              ? 'text-[#785A46] border-b-2 border-[#785A46]'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('security')}
        >
          <i className="pi pi-lock mr-2"></i> {t('profile.change_password', 'Đổi mật khẩu')}
        </button>
        <button
          className={`flex-1 min-w-[120px] py-4 text-center font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'sessions'
              ? 'text-[#785A46] border-b-2 border-[#785A46]'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('sessions')}
        >
          <i className="pi pi-desktop mr-2"></i> {t('profile.sessions', 'Thiết bị đăng nhập')}
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg mx-auto">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">{t('profile.personal_info', 'Thông tin cá nhân')}</h2>
            
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#785A46] text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
                {profile.username.charAt(0)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.full_name', 'Tên hiển thị')}</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-400 cursor-not-allowed text-sm font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.email', 'Email')}</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-400 cursor-not-allowed text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.phone', 'Số điện thoại')}</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#785A46] hover:bg-[#5C4033] text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm flex justify-center items-center"
            >
              {isLoading ? <i className="pi pi-spin pi-spinner mr-2"></i> : null}
              {t('profile.save_changes', 'Lưu thay đổi')}
            </button>
          </form>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <OrderHistoryPage />
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg mx-auto">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">{t('profile.change_password', 'Đổi mật khẩu')}</h2>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.old_password', 'Mật khẩu hiện tại')}</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 text-sm font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.new_password', 'Mật khẩu mới')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('profile.confirm_password', 'Xác nhận mật khẩu mới')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#785A46] hover:bg-[#5C4033] text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm flex justify-center items-center"
            >
              {isLoading ? <i className="pi pi-spin pi-spinner mr-2"></i> : null}
              {t('profile.update_password', 'Cập nhật mật khẩu')}
            </button>
          </form>
        )}


        {activeTab === 'sessions' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Nơi bạn đã đăng nhập</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Chúng tôi sẽ ghi nhận các thiết bị đã truy cập vào tài khoản của bạn. Vui lòng đăng xuất khỏi những thiết bị lạ.</p>
            
            <div className="space-y-4">
              {sessions.map((session, index) => {
                const isMobile = session.deviceName.toLowerCase().includes('iphone') || session.deviceName.toLowerCase().includes('android');
                const isCurrent = index === 0; // Giả sử item đầu tiên là thiết bị hiện tại
                
                return (
                  <div key={session.deviceId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl ${isCurrent ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-blue-500 dark:bg-slate-700 dark:text-blue-400'}`}>
                        <i className={`pi ${isMobile ? 'pi-mobile' : 'pi-desktop'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{session.deviceName}</p>
                          {isCurrent && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <span className="flex items-center gap-1"><i className="pi pi-map-marker text-xs"></i> {session.location}</span>
                          <span className="flex items-center gap-1"><i className="pi pi-clock text-xs"></i> {session.lastActive}</span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                          ID: {session.deviceId.substring(0, 15)}...
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrent && (
                      <button 
                        onClick={() => handleRevokeSession(session.deviceId)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        title="Đăng xuất thiết bị này"
                      >
                        <i className="pi pi-sign-out text-lg"></i>
                      </button>
                    )}
                  </div>
                );
              })}

              {sessions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <i className="pi pi-shield text-4xl text-gray-400 mb-3 block"></i>
                  <p className="text-gray-500">Đang tải thông tin thiết bị...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
