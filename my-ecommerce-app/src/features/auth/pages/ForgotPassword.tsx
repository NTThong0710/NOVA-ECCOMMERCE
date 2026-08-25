import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServices } from '../../../hook/useServices';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authService } = useServices();
  const navigate = useNavigate();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(username);
      setSuccess(typeof response === 'string' ? response : 'Vui lòng kiểm tra email của bạn để lấy liên kết đặt lại mật khẩu.');
      localStorage.setItem('pendingResetUsername', username);
      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err: any) {
      triggerShake();
      setError(err.response?.data || 'Có lỗi xảy ra!');
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
          <h1 className="text-3xl font-bold mb-2">Quên Mật Khẩu</h1>
          <p className="text-slate-400">Nhập email để nhận mã khôi phục.</p>
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

        <form onSubmit={handleForgot} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
              placeholder="Nhập email của bạn..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/30 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Đang Xử Lý...' : 'Gửi Mã Khôi Phục'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            &larr; Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
