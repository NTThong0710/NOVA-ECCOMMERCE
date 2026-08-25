export interface LoginResponse {
    token?: string;
    accessToken?: string;
    require2FA?: boolean;
}


export interface UserProfileDto {
    id?: number;
    username?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface IAuthService {
    login(username: string, password: string, captchaToken: string): Promise<LoginResponse>;
    loginWithGoogle(idToken: string): Promise<LoginResponse>;
    register(username: string, email: string, password: string, captchaToken: string): Promise<any>;
    verifyOtp(username: string, otpCode: string): Promise<LoginResponse>;
    forgotPassword(username: string): Promise<any>;
    resetPassword(username: string, otpCode: string, newPassword: string): Promise<any>;
    changePassword(oldPassword: string, newPassword: string): Promise<any>;
    getSessions(): Promise<any>;
    revokeSession(deviceId: string): Promise<any>;
    getUsers(): Promise<any>;
    getMe(): Promise<{ data: UserProfileDto }>;
    updateProfile(data: { fullName?: string; phone?: string }): Promise<any>;
}
