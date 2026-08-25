import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServices } from '../../../hook/useServices';
import { useAuthStore } from '../store/authStore';

export default function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { authService } = useServices();
  const loginToStore = useAuthStore((state) => state.login);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [username] = useState(() => localStorage.getItem('pendingOtpUsername'));

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, navigate, username]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setError('Please enter a 6-digit OTP code!');
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(username!, otpCode);

      const token = response.token ?? '';
      localStorage.setItem('accessToken', token);
      loginToStore(token, username ?? '');
      localStorage.removeItem('pendingOtpUsername');

      try {
        const meResponse = await authService.getMe();
        const profile = meResponse.data || meResponse;
        setProfile(profile as any);

        if (profile.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } catch {
        navigate('/home');
      }
    } catch (err: any) {
      triggerShake();
      const msg = err.response?.data?.message || err.response?.data || 'Invalid OTP code!';
      setError(typeof msg === 'string' ? msg : 'Invalid OTP code!');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-slate-50 dark:bg-slate-950 p-4">
      <div className={`w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 ${shake ? 'shake' : ''}`}>
        
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase mb-8 inline-block text-slate-900 dark:text-white">
            NOVA ECOMMERCE
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Two-Factor Auth</h1>
          <p className="text-slate-500 font-medium text-sm">
            A 6-digit code has been sent to <br />
            <span className="text-slate-900 dark:text-white font-bold">{username}</span>
          </p>
          <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider">
            Demo: Check the Auth Service terminal to see the printed OTP code.
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium mb-6">
            <i className="pi pi-exclamation-circle mt-0.5"></i>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={verifyOtp} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => { inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            ))}
          </div>

          <div className="text-center text-sm font-bold uppercase tracking-wider">
            {timeLeft > 0 ? (
              <p className="text-slate-400">
                Expires in <span className="text-slate-900 dark:text-white">{timeLeft}s</span>
              </p>
            ) : (
              <button type="button" className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors">
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#785A46] text-white font-bold text-sm tracking-widest uppercase hover:bg-[#5C4033] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <i className="pi pi-spinner pi-spin"></i>}
            {isLoading ? 'Verifying...' : 'Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
}
