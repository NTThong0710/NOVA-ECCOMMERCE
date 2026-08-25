import type { ApiClient } from '../../../core/interfaces/ApiClient';
import type { IUserService, UserProfile } from '../../../core/interfaces/IUserService';

export class UserService implements IUserService {
    private apiClient: ApiClient;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    async getProfile(): Promise<UserProfile> {
        const res = await this.apiClient.get<any>('/auth/me');
        return res.data || res;
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const res = await this.apiClient.put<any>('/auth/profile', data);
        return res.data || res;
    }

}
