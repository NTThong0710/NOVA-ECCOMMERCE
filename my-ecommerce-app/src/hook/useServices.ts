import { useContext } from 'react';
// import type vì chúng ta chỉ cần lấy khuôn mẫu (interface) của ServiceContext
import type { Services } from '../core/di/ServiceContext';
import { ServiceContext } from '../core/di/ServiceContext'; // Ở file trên, bạn nhớ export ServiceContext nhé

export const useServices = (): Services => {
  const context = useContext(ServiceContext);
  
  // TypeScript rất chặt chẽ: vì Context ban đầu có thể là `null`, 
  // ta phải kiểm tra xem context có tồn tại không trước khi return.
  if (!context) {
    throw new Error('useServices phải được gọi bên trong ServiceProvider');
  }
  
  return context;
};