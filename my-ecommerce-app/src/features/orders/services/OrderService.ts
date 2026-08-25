
import axios from 'axios';

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
}

export interface Order {
  id: number
  status: 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  shippingAddress: string
  fullName: string
  phone: string
  createdAt: string
  items: OrderItem[]
  payment?: { paymentMethod: string; status: string; transactionId: string }
}

const API_URL = 'http://localhost:8080/api/orders';

const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
};

export class OrderService {
    static async getMyOrders(): Promise<Order[]> {
        const res = await axios.get(API_URL, { headers: getHeaders() });
        return res.data;
    }

    static async getOrderById(id: number): Promise<Order> {
        const res = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
        return res.data;
    }
}
