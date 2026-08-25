import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServices } from '../../../hook/useServices';
import { useGoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { authService } = useServices();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!captchaToken) {
      setError('Please verify you are not a robot!');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(username, email, password, captchaToken);
      toast.success('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Registration failed. Username or Email may already exist.';
      setError(typeof msg === 'string' ? msg : 'Registration failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleTokenReceived = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGoogle(accessToken);
      const token = res.token || res.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      navigate('/home');

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Google sign up failed!';
      setError(typeof msg === 'string' ? msg : 'Google sign up failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleTokenReceived(tokenResponse.access_token),
    onError: () => setError('Google sign up failed!'),
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen flex flex-row-reverse font-sans bg-white dark:bg-slate-950">
      
      {/* Right side: Image (Reversed for Register page to add visual interest) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-100 dark:bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop" 
          alt="Fashion Lifestyle" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <Link to="/" className="text-3xl font-black tracking-tighter uppercase mb-6 inline-block">
            NOVA ECOMMERCE
          </Link>
          <h2 className="text-4xl font-medium leading-tight mb-4">
            Join the movement.
          </h2>
          <p className="text-white/80 max-w-md">
            Create an account to gain early access to collections, track orders seamlessly, and earn exclusive rewards.
          </p>
        </div>
      </div>

      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase mb-8 inline-block lg:hidden text-slate-900 dark:text-white">
              NOVA ECOMMERCE
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Create Account</h1>
            <p className="text-slate-500 font-medium">Begin your premium journey</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <i className="pi pi-exclamation-circle mt-0.5"></i>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm"
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
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

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className={`pi ${showConfirmPassword ? 'pi-eye-slash' : 'pi-eye'}`}></i>
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
              {isLoading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative pt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-950 text-slate-400 font-medium">Or register with</span>
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
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 dark:text-white font-bold underline underline-offset-4 decoration-2 decoration-slate-200 dark:decoration-slate-700 hover:decoration-[#785A46] dark:hover:decoration-[#785A46] transition-colors">
              Log in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
