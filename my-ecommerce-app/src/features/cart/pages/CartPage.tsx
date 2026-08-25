import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatCurrency';

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity } = useCartStore();
  
  const totalPrice = items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
  const originalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = originalPrice - totalPrice;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <i className="pi pi-shopping-cart text-4xl text-slate-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {t('cart.empty', 'Giỏ hàng của bạn đang trống')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm">
          {t('cart.empty_desc', 'Hãy khám phá thêm các sản phẩm tuyệt vời của NOVA ECOMMERCE')}
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center justify-center px-8 py-3.5 bg-[#785A46] hover:bg-[#5C4033] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
        >
          {t('cart.continue_shopping', 'Tiếp tục mua sắm')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase">
        {t('cart.title', 'Giỏ hàng của bạn')} <span className="text-slate-400 text-xl font-semibold ml-2">({items.length})</span>
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="w-full lg:w-3/5 space-y-4">
          {items.map(item => (
            <div 
              key={item.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Link to={`/product/${item.id}`} className="flex-shrink-0 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2 w-24 h-24 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain hover:scale-105 transition-transform" />
              </Link>
              
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {(item.brand || item.category) && (
                      <span className="text-xs font-bold text-[#785A46] dark:text-amber-400 uppercase tracking-wider mb-1 block">
                        {item.brand || item.category}
                      </span>
                    )}
                    <Link to={`/product/${item.id}`} className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-[#785A46] transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title={t('cart.remove', 'Xóa khỏi giỏ hàng')}
                  >
                    <i className="pi pi-trash"></i>
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold"
                    >
                      <i className="pi pi-minus text-xs"></i>
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold"
                      disabled={item.stockQuantity !== undefined && item.quantity >= item.stockQuantity}
                    >
                      <i className="pi pi-plus text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {item.discountPrice && item.discountPrice < item.price ? (
                      <>
                        <span className="text-base font-black text-red-500">
                          {formatCurrency(item.discountPrice * item.quantity)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 sticky top-28 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase">{t('cart.summary', 'Tóm tắt đơn hàng')}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold text-sm">
                <span>{t('cart.subtotal', 'Tạm tính')}</span>
                <span>{formatCurrency(originalPrice)}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold text-sm">
                  <span>{t('checkout.discount', 'Giảm giá')}</span>
                  <span>-{formatCurrency(savings)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
                <span>{t('checkout.shipping_fee', 'Phí vận chuyển')}</span>
                <span className="text-green-600 font-bold uppercase">{t('checkout.free_shipping', 'Miễn phí')}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-900 dark:text-white uppercase">{t('cart.total', 'Tổng cộng')}</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="w-full block text-center py-3.5 bg-[#785A46] hover:bg-[#5C4033] text-white font-bold uppercase tracking-widest text-xs transition-all rounded-xl shadow-sm"
            >
              {t('cart.checkout', 'Tiến Hành Thanh Toán')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;