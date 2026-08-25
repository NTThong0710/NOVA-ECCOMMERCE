import React, { useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'primereact/menu';
import { useCartStore } from '../features/cart/store/cartStore';
import { useAuthStore } from '../features/auth/store/authStore';
import { useCurrencyStore } from '../core/store/currencyStore';
import { ThemeToggle } from '../components/ThemeToggle';

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const menuRight = useRef<Menu>(null);
  
  const { currency, setCurrency } = useCurrencyStore();

  // Cắm dây lấy dữ liệu Giỏ hàng
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Mở Két sắt lấy dữ liệu Đăng nhập
  const { username, profile, logout } = useAuthStore();
  const isAdmin = profile?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    ...(isAdmin ? [
      {
        label: `👑 ${t('nav.admin', 'Quản Trị Hệ Thống')}`,
        icon: 'pi pi-shield',
        className: 'font-semibold text-blue-600 dark:text-blue-400',
        command: () => navigate('/admin')
      },
      {
        separator: true
      }
    ] : []),
    {
      label: t('nav.profile', 'Hồ sơ cá nhân'),
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: t('nav.orders', 'Đơn hàng của tôi'),
      icon: 'pi pi-shopping-bag',
      command: () => navigate('/orders')
    },
    {
      separator: true
    },
    {
      label: t('nav.logout', 'Đăng xuất'),
      icon: 'pi pi-sign-out',
      className: 'text-red-500',
      command: handleLogout
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/20 dark:border-slate-800/50 transition-colors">
        
        {/* Logo */}
        <Link to="/home" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tighter hover:opacity-80 transition-opacity">
          NOVA ECOMMERCE
        </Link>
        
        {/* Thanh tìm kiếm toàn cục */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const val = new FormData(e.currentTarget).get('search');
              if (val) navigate(`/products?search=${encodeURIComponent(val as string)}`);
            }}
            className="w-full relative group"
          >
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"></i>
            <input 
              name="search"
              type="text" 
              placeholder={t('nav.search_placeholder', 'Search collection...')} 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent focus:border-blue-500/30 rounded-full text-sm focus:ring-4 focus:ring-blue-500/10 outline-none dark:text-white transition-all backdrop-blur-sm"
            />
          </form>
        </div>
        
        <div className="flex gap-2.5 sm:gap-3.5 items-center">
          
          {/* Admin shortcut button */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-80 text-xs font-semibold rounded-full shadow-sm transition-opacity"
            >
              <i className="pi pi-shield text-xs"></i>
              <span>Admin</span>
            </Link>
          )}

          {/* Currency Switcher (USD / VNĐ) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${currency === 'USD' ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              USD
            </button>
            <button 
              onClick={() => setCurrency('VND')}
              className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${currency === 'VND' ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              VNĐ
            </button>
          </div>

          <ThemeToggle />

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <i className="pi pi-shopping-bag text-xl"></i>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {/* --- AUTHENTICATION --- */}
          {username ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 transition-colors"
                onClick={(e) => menuRight.current?.toggle(e)}
                aria-controls="popup_menu_right" 
                aria-haspopup
              >
                <div className="w-7 h-7 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold uppercase shadow-sm">
                  {username.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block tracking-tight">{username}</span>
              </div>
              <Menu model={userMenuItems} popup ref={menuRight} id="popup_menu_right" popupAlignment="right" />
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:opacity-70 transition-opacity ml-2"
            >
              {t('nav.login', 'Log in')}
            </button>
          )}
          {/* --------------------------------------- */}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-1 text-xs font-bold tracking-widest uppercase ml-1">
            <button 
              onClick={() => {
                i18n.changeLanguage('vi');
                setCurrency('VND');
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${i18n.language === 'vi' ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              VN
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button 
              onClick={() => {
                i18n.changeLanguage('en');
                setCurrency('USD');
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${i18n.language === 'en' ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      <main className="grow">
        <Outlet />
      </main>
    </div>
  );
};


export default MainLayout;