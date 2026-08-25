import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '../../../hook/useServices';
import type { Product } from '../../../core/interfaces/Product';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatCurrency';
import '../../../web-components/StarRating';
import { Link } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';

// 1. Import Component của PrimeReact
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

// 2. Import Kho lưu trữ Zustand
import { useCartStore } from '../../cart/store/cartStore';

const ProductList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { productService } = useServices();
  
  // 3. Cắm dây vào Kho để lấy cái "Hành động" thêm giỏ hàng ra dùng
  const addToCart = useCartStore((state) => state.addToCart);

  // 4. Tạo một dây nối (ref) để điều khiển cái thông báo Toast
  const toast = useRef<Toast>(null);

  // 1. Tạo State để lưu bộ lọc (Trang mấy, Đang tìm chữ gì)
  const [page, setPage] = useState(1);
  const [search] = useState("");
  const [category] = useState("");

  // 2. Kích hoạt TanStack Query
  const { data, isLoading, isError } = useQuery({
    // queryKey cực kỳ quan trọng: Nếu bất kỳ giá trị nào trong mảng này thay đổi (ví dụ page đổi từ 1 sang 2), 
    // TanStack Query sẽ tự động gọi lại API mà KHÔNG CẦN viết useEffect!
    queryKey: ['products', search, category, page], 
    
    // Hàm gọi API thực tế
    queryFn: () => productService.getProducts(search, category, page, 8), 
  });

  // Bóc tách dữ liệu an toàn
  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Hàm xử lý khi bấm nút
  const handleAddToCart = (product: Product) => {
    // 1. Nhét hàng vào Kho
    addToCart(product); 
    
    // 2. Bắn thông báo xịn xò
    toast.current?.show({ 
      severity: 'success', 
      summary: t('common.success'), 
      detail: t('common.added_to_cart', { item: product.title }), 
      life: 3000 // 3 giây tự động tắt
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton width="15rem" height="2rem" className="mb-2"></Skeleton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col gap-4">
              {/* Khung xương cho Hình ảnh */}
              <Skeleton width="100%" height="12rem"></Skeleton>
              
              {/* Khung xương cho Tiêu đề (2 dòng) */}
              <Skeleton width="100%" height="1.5rem"></Skeleton>
              <Skeleton width="70%" height="1.5rem"></Skeleton>
              
              {/* Khung xương cho Đánh giá */}
              <Skeleton width="40%" height="1rem"></Skeleton>
              
              {/* Khung xương cho Giá tiền và Nút */}
              <div className="flex justify-between items-center mt-2">
                <Skeleton width="30%" height="1rem"></Skeleton>
                <Skeleton width="20%" height="2rem"></Skeleton>
              </div>
              <Skeleton width="100%" height="3rem" className="mt-2"></Skeleton>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <div className="text-center p-20 text-xl font-bold text-red-500">{t('common.server_error')}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cái thẻ Toast này tàng hình, chỉ hiện ra khi ta gọi lệnh show() ở trên */}
      <Toast ref={toast} position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('product.welcome')}</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col">
            
            <Link to={`/product/${product.id}`} className="block hover:opacity-80 transition-opacity grow">
              <img src={product.image} alt={product.title} className="h-48 w-full object-contain mb-4 rounded-lg bg-white p-2" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 line-clamp-2" title={product.title}>
                {product.title}
              </h3>
            </Link>
            
            <star-rating rating={product.rating.rate}></star-rating>

            <div className="flex justify-between items-center mt-2 mb-4">
              <span className="text-gray-500 dark:text-gray-400">{t('product.price')}</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xl">
                {formatCurrency(product.price, i18n.language)}
              </span>
            </div>

            {/* Nút bấm của PrimeReact */}
            <Button 
              label={t('product.add_to_cart')} 
              icon="pi pi-cart-plus" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={() => handleAddToCart(product)} 
            />
          </div>
        ))}
      </div>

      {/* KHU VỰC PHÂN TRANG */}
      <div className="flex justify-center items-center gap-6 mt-12 mb-8">
        <Button 
          icon="pi pi-chevron-left" 
          label={t('common.prev_page')} 
          disabled={page === 1} // Khóa nút nếu đang ở trang 1
          onClick={() => setPage(p => p - 1)} 
          className="p-button-outlined"
        />
        
        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
          {t('common.page')} {page} / {totalPages}
        </span>
        
        <Button 
          icon="pi pi-chevron-right" 
          label={t('common.next_page')} 
          iconPos="right"
          disabled={page >= totalPages} // Khóa nút nếu đã tới trang cuối
          onClick={() => setPage(p => p + 1)} 
          className="p-button-outlined"
        />
      </div>
    </div>
  );
};

export default ProductList;