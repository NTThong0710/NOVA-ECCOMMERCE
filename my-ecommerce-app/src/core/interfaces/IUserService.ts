export interface UserProfile {
    id?: number;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    roles?: string[];
}

export interface IUserService {
    getProfile(): Promise<UserProfile>;
    updateProfile(data: Partial<UserProfile>): Promise<UserProfile>;
}
