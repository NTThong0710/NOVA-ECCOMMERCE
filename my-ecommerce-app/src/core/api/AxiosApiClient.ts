import axios, { type AxiosInstance } from 'axios';
import type { ApiClient } from '../interfaces/ApiClient';
import { useAuthStore } from '../../features/auth/store/authStore';
import toast from 'react-hot-toast';

export class AxiosApiClient implements ApiClient {
    private instance: AxiosInstance;
    private loadingToastId: string | undefined;

    constructor(baseUrl: string) {
        this.instance = axios.create({
            baseURL: baseUrl,
            withCredentials: true, // Quan trọng: Cho phép gửi HttpOnly Cookie
        });

        // 1. Request Interceptor: Tự động đính kèm Access Token vào Header
        this.instance.interceptors.request.use(
            (config) => {
                // Chỉ hiển thị loading với các request thay đổi dữ liệu (POST, PUT, DELETE)
                if (config.method && config.method.toLowerCase() !== 'get') {
                    this.loadingToastId = toast.loading('Đang xử lý...');
                }

                const token = useAuthStore.getState().accessToken;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                if (this.loadingToastId) toast.dismiss(this.loadingToastId);
                return Promise.reject(error);
            }
        );

        // 2. Response Interceptor: Bắt lỗi 401 (Hết hạn Token) và gọi Refresh API
        this.instance.interceptors.response.use(
            (response) => {
                if (this.loadingToastId) {
                    toast.dismiss(this.loadingToastId);
                }
                return response;
            },
            async (error) => {
                if (this.loadingToastId) {
                    toast.dismiss(this.loadingToastId);
                }

                const originalRequest = error.config;
                // Nếu lỗi 401 và chưa từng thử refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        // Gọi API lấy Access Token mới (Tự động gửi Cookie đi)
                        const refreshResponse = await axios.post(
                            `${baseUrl}/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        
                        const newAccessToken = refreshResponse.data.token;
                        
                        // Cập nhật Token mới vào Store
                        useAuthStore.getState().setAccessToken(newAccessToken);
                        
                        // Gắn Token mới vào Request cũ và chạy lại
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return this.instance(originalRequest);
                        
                    } catch (refreshError) {
                        // Nếu Refresh Token cũng chết -> Ép văng ra Đăng nhập lại
                        useAuthStore.getState().logout();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                // Xử lý thông báo lỗi
                if (error.response?.status === 429) {
                    toast.error('Hệ thống đang xử lý nhiều yêu cầu, vui lòng thử lại sau vài giây!');
                } else if (error.response?.status === 403) {
                    toast.error('Bạn không có quyền thực hiện thao tác này!');
                } else {
                    const errorMessage = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra!';
                    toast.error(typeof errorMessage === 'string' ? errorMessage : 'Có lỗi xảy ra!');
                }
                
                // Chỉ redirect về /login nếu thực sự bị 401 trên route bảo mật
                if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string): Promise<T> {
        const response = await this.instance.get<T>(url);
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.instance.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.instance.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.instance.delete<T>(url);
        return response.data;
    }
}
