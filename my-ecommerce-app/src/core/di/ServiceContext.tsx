import React, { createContext, useMemo } from 'react';
import { AxiosApiClient } from '../api/AxiosApiClient';
import { ProductService } from '../../features/products/services/ProductService';
import { AuthService } from '../../features/auth/services/AuthService';
import { UserService } from '../../features/user/services/UserService';
import type { IProductService } from '../interfaces/IProductService';
import type { IAuthService } from '../interfaces/IAuthService';
import type { IUserService } from '../interfaces/IUserService';

// 1. Định nghĩa khuôn mẫu (Type) cho những dịch vụ chúng ta sẽ cung cấp
export interface Services {
  productService: IProductService;
  authService: IAuthService;
  userService: IUserService;
  // Sau này có CartService thì thêm vào đây
}

// 2. Tạo Context với giá trị mặc định là null. 
// `<Services | null>` là TypeScript Generics: Nó báo cho React biết Context này chứa cái gì.
export const ServiceContext = createContext<Services | null>(null);

// 3. Tạo một Component Provider để "bao bọc" toàn bộ ứng dụng
export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useMemo giúp đảm bảo các object này chỉ được tạo ra 1 lần duy nhất khi web chạy
  const services = useMemo(() => {
    // Đây là nơi duy nhất chúng ta khởi tạo các Class!
    const apiClient = new AxiosApiClient('http://localhost:8080');
    const productService = new ProductService(apiClient);
    const authService = new AuthService(apiClient);
    const userService = new UserService(apiClient);

    return { productService, authService, userService };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};