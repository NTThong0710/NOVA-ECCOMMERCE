
import axios from 'axios';
import { API_BASE_URL } from '../../../core/api/apiConfig';

const API_BASE = `${API_BASE_URL}/api/orders`;


const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
};

export class AdminOrderService {
    static async getAllOrders(page: number, status?: string): Promise<any> {
        let url = `${API_BASE}/admin/orders?page=${page}&size=20`;
        if (status) url += `&status=${status}`;
        const res = await axios.get(url, { headers: getHeaders() });
        return res.data;
    }

    static async updateOrderStatus(id: number, status: string): Promise<any> {
        const res = await axios.patch(`${API_BASE}/admin/orders/${id}/status`, { status }, { headers: getHeaders() });
        return res.data;
    }

    static async getOrderStats(): Promise<any> {
        const res = await axios.get(`${API_BASE}/admin/orders/stats`, { headers: getHeaders() });
        return res.data;
    }
}
