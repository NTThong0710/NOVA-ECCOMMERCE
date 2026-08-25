import { create } from 'zustand';
import type { Product } from '../../../core/interfaces/Product';

// 1. Định nghĩa kiểu dữ liệu cho món hàng trong giỏ (Kế thừa Product và thêm số lượng)
export interface CartItem extends Product {
  quantity: number;
}

// 2. Bản thiết kế cho cái Kho (Gồm Dữ liệu và các Hành động)
interface CartState {
  items: CartItem[]; // Dữ liệu: Danh sách hàng
  addToCart: (product: Product) => void; // Hành động 1
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

// 3. Khởi tạo Kho bằng hàm `create` của zustand
export const useCartStore = create<CartState>((set) => ({
  // Dữ liệu ban đầu (State)
  items: [],

  // Các hành động (Actions)
  addToCart: (product) => set((state) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = state.items.find(item => item.id === product.id);
    
    if (existingItem) {
      // Nếu có rồi thì tăng số lượng lên 1
      return {
        items: state.items.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    } else {
      // Nếu chưa có thì thêm mới vào mảng với số lượng = 1
      return {
        items: [...state.items, { ...product, quantity: 1 }]
      };
    }
  }),

  updateQuantity: (productId, quantity) => set((state) => ({
    items: quantity <= 0 
      ? state.items.filter(item => item.id !== productId)
      : state.items.map(item => item.id === productId ? { ...item, quantity } : item)
  })),

  removeFromCart: (productId) => set((state) => ({
    // Lọc bỏ sản phẩm có id trùng với id truyền vào
    items: state.items.filter(item => item.id !== productId)
  })),

  clearCart: () => set({ items: [] })
}));