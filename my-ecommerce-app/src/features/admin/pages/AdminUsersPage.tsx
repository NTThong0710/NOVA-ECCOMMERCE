
import { useEffect, useState } from 'react';
import { useServices } from '../../../hook/useServices';
import { Tag } from 'primereact/tag';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  username: string;
  role: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { authService } = useServices();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getRoleSeverity = (role: string) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'SELLER') return 'info';
    return 'success';
  };

  const formatDate = (dt?: string) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Quản lý Người dùng</h1>
        <p className="text-neutral-500 mt-1 text-sm">Toàn bộ tài khoản đã đăng ký trong hệ thống</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <i className="pi pi-spin pi-spinner text-3xl mr-3" />
            Đang tải...
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-slate-800/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tên đăng nhập</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-neutral-400 font-mono">#{user.id}</td>
                  <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Tag value={user.role} severity={getRoleSeverity(user.role)} />
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                    Không có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-sm text-neutral-400">
        Tổng cộng: <strong className="text-neutral-700 dark:text-neutral-300">{users.length}</strong> tài khoản
      </div>
    </div>
  );
}
