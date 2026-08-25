import type { ApiClient } from '../../../core/interfaces/ApiClient';
import type { IAuthService, LoginResponse } from '../../../core/interfaces/IAuthService';

export class AuthService implements IAuthService {
    private apiClient: ApiClient;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    async login(username: string, password: string, captchaToken: string): Promise<LoginResponse> {
        return this.apiClient.post<LoginResponse>('/auth/login', { username, password, captchaToken });
    }

    async loginWithGoogle(idToken: string): Promise<LoginResponse> {
        return this.apiClient.post<LoginResponse>('/auth/google', { idToken });
    }

    async register(username: string, email: string, password: string, captchaToken: string): Promise<any> {
        return this.apiClient.post<any>('/auth/register', { username, email, password, captchaToken });
    }

    async verifyOtp(username: string, otpCode: string): Promise<LoginResponse> {
        return this.apiClient.post<LoginResponse>('/auth/verify-otp', { username, otpCode });
    }

    async forgotPassword(username: string): Promise<any> {
        return this.apiClient.post<any>('/auth/forgot-password', { username });
    }

    async resetPassword(username: string, otpCode: string, newPassword: string): Promise<any> {
        return this.apiClient.post<any>('/auth/reset-password', { username, otpCode, newPassword });
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<any> {
        return this.apiClient.post<any>('/auth/change-password', { oldPassword, newPassword });
    }

    async getSessions(): Promise<any> {
        return this.apiClient.get<any>('/auth/sessions');
    }

    async revokeSession(deviceId: string): Promise<any> {
        return this.apiClient.delete<any>(`/auth/sessions/${deviceId}`);
    }

    async getUsers(): Promise<any> {
        return this.apiClient.get<any>('/auth/users');
    }

    async getMe(): Promise<any> {
        return this.apiClient.get<any>('/auth/me');
    }

    async updateProfile(data: { fullName?: string; phone?: string }): Promise<any> {
        return this.apiClient.put<any>('/auth/profile', data);
    }
}
