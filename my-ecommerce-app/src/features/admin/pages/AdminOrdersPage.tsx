
import { useEffect, useState } from 'react';
import { AdminOrderService } from '../services/AdminOrderService';
import { Button } from 'primereact/button';
import { toast } from 'react-hot-toast';
import { Tag } from 'primereact/tag';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        loadOrders();
    }, [page]);

    const loadOrders = async () => {
        try {
            const data = await AdminOrderService.getAllOrders(page);
            setOrders(data.content || data.items || data || []);
        } catch (error) {
            toast.error('Lỗi khi tải đơn hàng');
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await AdminOrderService.updateOrderStatus(id, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            loadOrders();
        } catch (error) {
            toast.error('Lỗi cập nhật trạng thái');
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Quản lý Đơn hàng</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
                {['Tổng đơn', 'Doanh thu', 'Chờ xử lý', 'Đang giao'].map(stat => (
                    <div key={stat} className="bg-blue-50 dark:bg-slate-800 p-4 rounded text-center">
                        <div className="text-gray-500">{stat}</div>
                        <div className="text-2xl font-bold">---</div>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">ID</th>
                            <th className="p-2">Tổng tiền</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b">
                                <td className="p-2">{o.id}</td>
                                <td className="p-2">{o.totalAmount?.toLocaleString()}đ</td>
                                <td className="p-2">
                                    <Tag value={o.status} />
                                </td>
                                <td className="p-2">
                                    <Button size="small" label="Tiến tới" onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-between mt-4">
                <Button label="Trang trước" disabled={page === 0} onClick={() => setPage(p => p - 1)} />
                <Button label="Trang sau" onClick={() => setPage(p => p + 1)} />
            </div>
        </div>
    );
};
export default AdminOrdersPage;
