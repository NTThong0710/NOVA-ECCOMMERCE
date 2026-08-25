import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServices } from '../../../hook/useServices';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token] = useState(searchParams.get('token') || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authService } = useServices();

  const username = localStorage.getItem('pendingResetUsername');

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [navigate, username]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      triggerShake();
      return;
    }

    if (!token && !otpCode) {
      setError('Mã xác nhận không hợp lệ!');
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      // API expects username, otpCode, and newPassword
      await authService.resetPassword(username || '', token || otpCode, newPassword);
      
      toast.success('Khôi phục mật khẩu thành công! Đang chuyển hướng...');
      localStorage.removeItem('pendingResetUsername');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err: any) {
      triggerShake();
      setError(err.response?.data || 'Link khôi phục đã hết hạn hoặc không hợp lệ!');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="auth-background flex items-center justify-center min-h-screen p-4">
      <div className={`glass-panel w-full max-w-md p-8 ${shake ? 'shake' : ''}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tạo Mật Khẩu Mới</h1>
          <p className="text-slate-400">Nhập mã OTP và mật khẩu mới của bạn.</p>
          <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
            💡 Dành cho Demo: Vui lòng mở cửa sổ Terminal của <b>Auth Service</b> để xem mã OTP.
          </div>
        </div>


        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mã OTP (6 số)</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white tracking-widest text-center text-lg"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/30 mt-4 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Đang Đổi Mật Khẩu...' : 'Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
