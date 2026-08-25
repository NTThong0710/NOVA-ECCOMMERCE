import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../../../components/ThemeToggle';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Admin Panel
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md font-medium transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md font-medium transition-colors">
            <Users size={20} />
            Users
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md font-medium transition-colors">
            <Package size={20} />
            Products
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md font-medium transition-colors">
            <ShoppingCart size={20} />
            Orders
          </Link>
          <Link to="/admin/promotions" className="flex items-center gap-3 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md font-medium transition-colors">
            <Package size={20} />
            Khuyến mãi
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="ghost" className="w-full flex justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={handleLogout}>
            <LogOut size={20} />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-end px-6 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 border-l border-neutral-200 dark:border-neutral-700 pl-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="font-medium text-sm text-neutral-700 dark:text-neutral-200">Super Admin</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 text-neutral-900 dark:text-neutral-100">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
