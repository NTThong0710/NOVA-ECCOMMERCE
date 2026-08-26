import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../../core/api/apiConfig';

const API_BASE = API_BASE_URL;


const getHeaders = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

interface OrderItem {
    id: number;
    productId: number;
    productTitle?: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            let res;
            try {
                res = await axios.get(`${API_BASE}/api/orders`, { headers: getHeaders() });
            } catch {
                res = await axios.get(`${API_BASE}/orders`, { headers: getHeaders() });
            }
            setOrders(Array.isArray(res.data) ? res.data : (res.data?.content || []));
        } catch (error) {
            toast.error(t('common.error', 'Failed to load orders'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'PENDING_PAYMENT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'CONFIRMED':
            case 'PAID': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'SHIPPED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ALL': return t('orders.filter_all', 'Tất cả');
            case 'PENDING': return t('orders.filter_pending', 'Chờ xử lý');
            case 'CONFIRMED': return t('orders.filter_confirmed', 'Đã xác nhận');
            case 'SHIPPED': return t('orders.filter_shipped', 'Đang giao');
            case 'DELIVERED': return t('orders.filter_delivered', 'Đã giao');
            case 'CANCELLED': return t('orders.filter_cancelled', 'Đã hủy');
            default: return status;
        }
    };

    const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);
    const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 font-sans">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase">
                {t('orders.title', 'Lịch Sử Đơn Hàng')}
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button 
                        key={tab} 
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${
                            filterStatus === tab 
                                ? 'bg-[#785A46] text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilterStatus(tab)}
                    >
                        {getStatusLabel(tab)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <i className="pi pi-box text-5xl text-slate-300 dark:text-slate-700 mb-4 block"></i>
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-400">{t('orders.no_orders', 'Bạn chưa có đơn hàng nào!')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 transition-all hover:shadow-md">
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('orders.order_id', 'Mã đơn')}</span>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">#{order.id}</h3>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('orders.order_date', 'Ngày đặt')}</span>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="py-4 divide-y divide-slate-100 dark:divide-slate-800">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="py-3 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-500">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {item.productTitle || `${t('orders.items', 'Sản phẩm')} #${item.productId}`}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('orders.total', 'Tổng thanh toán')}</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
