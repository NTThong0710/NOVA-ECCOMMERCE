import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useServices } from '../../../hook/useServices';
import ReCAPTCHA from 'react-google-recaptcha';
import { useGoogleLogin } from '@react-oauth/google';


const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);
  const setProfile = useAuthStore((state) => state.setProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { authService } = useServices();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const quickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Vui lòng xác thực reCAPTCHA!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(username, password, captchaToken);
      
      if (res.require2FA) {
        localStorage.setItem('pendingOtpUsername', username);
        navigate('/verify-otp');
        return;
      }

      const token = res.token || res.accessToken;
      if (!token) throw new Error('Không nhận được token từ server');

      loginToStore(token, username);
      
      try {
        const meData = await authService.getMe();
        const profile = meData.data || meData;
        setProfile(profile as any);
        if (profile.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } catch (meError) {
        navigate('/home');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.';
      setError(typeof msg === 'string' ? msg : 'Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleTokenReceived = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGoogle(accessToken);
      const token = res.token || res.accessToken;
      if (!token) throw new Error('No token received');

      loginToStore(token, '');

      try {
        const meData = await authService.getMe();
        const profile = meData.data || meData;
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
      const msg = err?.response?.data?.message || err?.response?.data || 'Đăng nhập bằng Google thất bại!';
      setError(typeof msg === 'string' ? msg : 'Đăng nhập bằng Google thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleTokenReceived(tokenResponse.access_token),
    onError: () => setError('Đăng nhập bằng Google thất bại!'),
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen flex font-sans bg-white dark:bg-slate-950">
      
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-100 dark:bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <Link to="/" className="text-3xl font-black tracking-tighter uppercase mb-6 inline-block">
            NOVA ECOMMERCE
          </Link>
          <h2 className="text-4xl font-medium leading-tight mb-4">
            Discover the new spatial reality of fashion.
          </h2>
          <p className="text-white/80 max-w-md">
            Log in to access your personalized collection, track orders, and enjoy exclusive member benefits.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-center lg:text-left">
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase mb-8 inline-block lg:hidden text-slate-900 dark:text-white">
              NOVA ECOMMERCE
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Log In</h1>
            <p className="text-slate-500 font-medium">Welcome back to your account</p>
          </div>

          {/* Quick Demo Fill */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => quickFill('admin', 'Admin@123')}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 transition-colors text-left"
              >
                Admin
              </button>
              <button 
                type="button"
                onClick={() => quickFill('customer', 'Customer@123')}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 transition-colors text-left"
              >
                Customer
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <i className="pi pi-exclamation-circle mt-0.5"></i>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email / Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold border-b border-transparent hover:border-slate-900 dark:hover:border-white">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <div className="transform scale-90 sm:scale-100 origin-center">
                <ReCAPTCHA
                  sitekey="6Ld_okQtAAAAAC2uZQpS4aFEneAf-Bv5qCNbA7MT"
                  onChange={(token: string | null) => setCaptchaToken(token)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#785A46] text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-[#5C4033] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading && <i className="pi pi-spinner pi-spin"></i>}
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="relative pt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-950 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-900 dark:text-white font-bold underline underline-offset-4 decoration-2 decoration-slate-200 dark:decoration-slate-700 hover:decoration-[#785A46] dark:hover:decoration-[#785A46] transition-colors">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
