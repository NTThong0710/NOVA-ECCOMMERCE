
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/products';
const ADMIN_API_URL = 'http://localhost:8080/api/admin/products';

const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
};

export class AdminProductService {
    static async getAllProducts(page: number, search: string): Promise<any> {
        const res = await axios.get(`${API_URL}?page=${page}&search=${search}`, { headers: getHeaders() });
        return res.data;
    }

    static async createProduct(data: any): Promise<any> {
        const res = await axios.post(ADMIN_API_URL, data, { headers: getHeaders() });
        return res.data;
    }

    static async updateProduct(id: number, data: any): Promise<any> {
        const res = await axios.put(`${ADMIN_API_URL}/${id}`, data, { headers: getHeaders() });
        return res.data;
    }

    static async deleteProduct(id: number): Promise<void> {
        await axios.delete(`${ADMIN_API_URL}/${id}`, { headers: getHeaders() });
    }

    static async toggleProductStatus(id: number): Promise<any> {
        const res = await axios.patch(`${ADMIN_API_URL}/${id}/toggle-status`, {}, { headers: getHeaders() });
        return res.data;
    }

    static async uploadProductImage(productId: number, file: File): Promise<string[]> {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${ADMIN_API_URL}/${productId}/images`, formData, { 
            headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
}
