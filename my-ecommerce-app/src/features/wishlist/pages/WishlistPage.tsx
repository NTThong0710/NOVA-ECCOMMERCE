import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../../cart/store/cartStore';
import ProductCard from '../../products/components/ProductCard';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const { items, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((product) => {
      addToCart({ ...product, quantity: 1 } as any);
    });
    toast.success(
      t('wishlist.all_added_cart_toast', 'Đã thêm tất cả sản phẩm vào giỏ hàng!'),
      {
        icon: '🛒',
        style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans pb-24">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              {t('nav.home', 'Trang chủ')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {t('wishlist.title', 'Danh sách yêu thích')}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {t('wishlist.title', 'Danh sách yêu thích')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {items.length > 0
                  ? t('wishlist.item_count', { count: items.length, defaultValue: `Bạn có ${items.length} sản phẩm trong danh sách yêu thích.` })
                  : t('wishlist.empty_desc', 'Chưa có sản phẩm nào được lưu.')}
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('wishlist.clear_all', 'Xóa tất cả')}
                </button>
                <button
                  onClick={handleAddAllToCart}
                  className="px-6 py-2.5 rounded-xl bg-[#785A46] hover:bg-[#5C4033] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                >
                  <i className="pi pi-shopping-cart text-sm"></i>
                  {t('wishlist.add_all_cart', 'Thêm tất cả vào giỏ')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-6 shadow-inner">
              <i className="pi pi-heart text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {t('wishlist.empty_title', 'Danh sách yêu thích trống')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {t(
                'wishlist.empty_suggestion',
                'Hãy bấm vào biểu tượng trái tim trên các sản phẩm bạn ưng ý để lưu lại và mua sắm sau!'
              )}
            </p>
            <Link
              to="/products"
              className="bg-[#785A46] hover:bg-[#5C4033] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md inline-flex items-center gap-2"
            >
              <i className="pi pi-compass"></i>
              {t('wishlist.explore', 'Khám phá sản phẩm ngay')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;