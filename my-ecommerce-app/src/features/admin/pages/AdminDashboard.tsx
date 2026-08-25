import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, Monitor, Trash2, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useServices } from '../../../hook/useServices';
import { AdminOrderService } from '../services/AdminOrderService';

interface Session {
  deviceId: string;
  deviceName: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}

const AdminDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const { authService } = useServices();

  useEffect(() => {
    fetchSessions();
    fetchUsers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await AdminOrderService.getOrderStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await authService.getSessions();
      const sessionList = response.map((session: any) => ({
        deviceId: session.id || session.deviceId,
        deviceName: session.deviceName || 'Thiết bị không xác định'
      }));
      setSessions(sessionList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authService.getUsers();
      setUsers(Array.isArray(response) ? response : response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSession = async (deviceId: string) => {
    try {
      await authService.revokeSession(deviceId);
      setSessions(sessions.filter(s => s.deviceId !== deviceId));
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard Tổng quan</h1>
        <p className="text-neutral-500 mt-2 text-sm">Chào mừng bạn trở lại, đây là thống kê hệ thống</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats ? formatCurrency(stats.totalRevenue) : '...'}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Tổng doanh thu từ tất cả đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length > 0 ? `+${users.length}` : '...'}</div>
            <p className="text-xs text-neutral-500 mt-1">Tài khoản đăng ký trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalOrders : '...'}</div>
            <p className="text-xs text-neutral-500 mt-1">
              Chờ xử lý: {stats ? (stats.ordersByStatus?.['PENDING'] || 0) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã Giao</CardTitle>
            <Activity className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats ? (stats.ordersByStatus?.['DELIVERED'] || 0) : '...'}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Đơn hàng giao thành công</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Người Dùng Hệ Thống</CardTitle>
            <CardDescription>Danh sách tài khoản đã đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 dark:bg-slate-800/50 text-neutral-600 dark:text-neutral-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Quyền hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">#{user.id}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          user.role === 'SELLER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-neutral-400 text-sm">Đang tải...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Active Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết Bị Của Quản Trị Viên</CardTitle>
            <CardDescription>Bảo mật tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.deviceId} className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-700 rounded-lg hover:border-neutral-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{session.deviceName}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-1">ID: {String(session.deviceId).substring(0, 20)}...</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleRevokeSession(session.deviceId)}>
                    <Trash2 size={16} className="mr-2" />
                    Kích
                  </Button>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-center text-neutral-500 py-4 text-sm">Không có dữ liệu thiết bị</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
