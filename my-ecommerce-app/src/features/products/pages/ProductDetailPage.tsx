import React, { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '../../../hook/useServices';
import type { Product, ProductVariant, ReviewResponse } from '../../../core/interfaces/Product';
import { useCartStore } from '../../cart/store/cartStore';
import { useAuthStore } from '../../auth/store/authStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { StarDisplay } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────

const ImageGallery: React.FC<{ product: Product }> = ({ product }) => {
  const allImages = product.images?.length
    ? product.images.map(img => img.imageUrl)
    : [product.image];
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-slate-50 dark:bg-slate-700/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <img
          src={allImages[selected]}
          alt={product.title}
          className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image'; }}
        />
        {/* Zoom hint */}
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Phóng to
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200
                ${selected === idx ? 'border-blue-500 shadow-md shadow-blue-200' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}
            >
              <img src={img} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={allImages[selected]} alt="" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const VariantSelector: React.FC<{
  variants: ProductVariant[];
  selected: Record<string, string>;
  onChange: (type: string, value: string) => void;
}> = ({ variants, selected, onChange }) => {
  // Group variants by type
  const grouped: Record<string, ProductVariant[]> = {};
  variants.forEach(v => {
    if (!grouped[v.variantType]) grouped[v.variantType] = [];
    grouped[v.variantType].push(v);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, options]) => (
        <div key={type}>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 capitalize">
            {type}: <span className="text-blue-600 font-bold">{selected[type] || 'Chưa chọn'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const isSelected = selected[type] === opt.variantValue;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChange(type, isSelected ? '' : opt.variantValue)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-150
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-200'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                    }
                    ${opt.stockQuantity === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}
                  `}
                  disabled={opt.stockQuantity === 0}
                >
                  {opt.variantValue}
                  {opt.priceAdjustment && opt.priceAdjustment !== 0 && (
                    <span className="ml-1 text-xs text-slate-400">
                      {opt.priceAdjustment > 0 ? `+${opt.priceAdjustment.toLocaleString()}` : opt.priceAdjustment.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReviewSection: React.FC<{ productId: string; ratingAvg: number; ratingCount: number }> = ({ productId, ratingAvg, ratingCount }) => {
  const { t } = useTranslation();
  const { productService } = useServices();
  const username = useAuthStore(s => s.username);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);


  const { data, refetch } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => productService.getProductReviews(productId, page, 5),
  });

  const reviews: ReviewResponse[] = (data as any)?.content ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error(t('product.review_login_required', 'Vui lòng đăng nhập để đánh giá!'));
      return;
    }
    if (!form.comment.trim()) {
      toast.error(t('product.review_empty_error', 'Vui lòng nhập nội dung đánh giá!'));
      return;
    }
    setSubmitting(true);
    try {
      await productService.addReview(productId, {
        rating: form.rating,
        comment: form.comment.trim(),
        username: username,
      });
      toast.success(t('product.review_success', 'Cảm ơn bạn đã đánh giá!'));
      setForm({ rating: 5, comment: '' });
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('product.review_fail', 'Không thể gửi đánh giá. Thử lại sau!');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl">
        <div className="text-center">
          <div className="text-5xl font-black text-slate-800 dark:text-white">{ratingAvg.toFixed(1)}</div>
          <StarDisplay rating={ratingAvg} size="md" />
          <p className="text-sm text-slate-400 mt-1">{ratingCount} {t('product.reviews', 'đánh giá')}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingDist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-4">{star}★</span>
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: ratingCount > 0 ? `${(count / ratingCount) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review */}
      <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('product.write_review', 'Viết đánh giá của bạn')}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">{t('product.rating_select', 'Chọn số sao')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <svg className={`w-8 h-8 ${star <= form.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={3}
            placeholder={t('product.review_placeholder', 'Chia sẻ trải nghiệm của bạn với sản phẩm này...')}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#785A46] dark:text-slate-200 placeholder-slate-400 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#785A46] hover:bg-[#5C4033] text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {t('product.submit_review', 'Gửi đánh giá')}
          </button>
        </form>
      </div>


      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {review.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{review.username}</span>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <StarDisplay rating={review.rating} />
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 py-8">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────

const TABS = ['Mô tả sản phẩm', 'Thông số kỹ thuật', 'Đánh giá & Nhận xét'] as const;
type Tab = typeof TABS[number];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { productService } = useServices();
  const addToCart = useCartStore(state => state.addToCart);


  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>('Mô tả sản phẩm');

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ['related-products', id],
    queryFn: () => productService.getRelatedProducts(id!),
    enabled: !!id,
  });

  const handleVariantChange = useCallback((type: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [type]: value }));
  }, []);

  const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product!.discountPrice! / product!.price) * 100) : 0;
  const isOutOfStock = product?.stockQuantity === 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, selectedVariants, quantity } as any);
    toast.success(`Đã thêm vào giỏ hàng!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({ ...product, selectedVariants, quantity } as any);
    navigate('/cart');
  };

  // ──── Loading skeleton ────
  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-full" />
          <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-xl font-bold text-slate-700 dark:text-slate-200">Không tìm thấy sản phẩm</p>
      <Link to="/products" className="mt-4 inline-block text-blue-500 hover:underline text-sm">← Quay lại danh sách</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Sản phẩm</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category}`} className="hover:text-slate-600 dark:hover:text-slate-200 capitalize transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 items-start">
          {/* LEFT Gallery - Sticky */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <ImageGallery product={product} />
          </div>

          {/* RIGHT Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-8 pt-4">
            {/* Brand + Category */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <Link to={`/products?category=${product.category}`} className="text-xs text-slate-400 hover:text-slate-600 capitalize">
                  {product.category}
                </Link>
              )}
              {product.sku && (
                <span className="text-xs text-slate-300 dark:text-slate-600 ml-auto">SKU: {product.sku}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
              {product.title}
            </h1>

            {/* Rating + sold */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarDisplay rating={product.rating?.rate || 0} size="md" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {product.rating?.rate?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-slate-400">|</span>
              <span className="text-sm text-slate-500">{product.rating?.count?.toLocaleString() || 0} đánh giá</span>
              <span className="text-sm text-slate-400">|</span>
              <span className="text-sm text-slate-500">Còn {product.stockQuantity?.toLocaleString() || 0} sản phẩm</span>
            </div>

            {/* Price */}
            <div className="my-2">
              {hasDiscount ? (
                <div className="flex items-end gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight">
                    {formatCurrency(product.discountPrice!, i18n.language)}
                  </span>
                  <div className="flex flex-col pb-1">
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.price, i18n.language)}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full text-center">
                      -{discountPercent}%
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(product.price, i18n.language)}
                </span>
              )}
              {hasDiscount && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  💰 Tiết kiệm {formatCurrency(product.price - product.discountPrice!, i18n.language)}
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selected={selectedVariants}
                onChange={handleVariantChange}
              />
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
              {isOutOfStock && (
                <span className="text-sm text-red-500 font-medium">⚠ Hết hàng</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-4 border border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-none font-bold text-sm tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t('product.add_to_cart', 'Thêm vào giỏ')}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-4 bg-[#785A46] hover:bg-[#5C4033] text-white rounded-none font-bold text-sm tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {t('product.buy_now', 'Mua ngay')}
              </button>
            </div>


            {/* Shipping + Policy info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🚚', title: 'Giao hàng nhanh', desc: 'Miễn phí vận chuyển đơn > 200K' },
                { icon: '🔄', title: 'Đổi trả dễ dàng', desc: 'Trong vòng 30 ngày' },
                { icon: '🛡️', title: 'Bảo hành chính hãng', desc: 'Sản phẩm chính hãng 100%' },
                { icon: '💳', title: 'Thanh toán an toàn', desc: 'Mã hóa SSL bảo mật' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-2.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ──── Tabs Section ──── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'Mô tả sản phẩm' && (
              <div
                className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || '<p class="text-slate-400">Chưa có mô tả sản phẩm.</p>' }}
              />
            )}

            {activeTab === 'Thông số kỹ thuật' && (
              <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Thương hiệu', value: product.brand },
                      { label: 'SKU', value: product.sku },
                      { label: 'Danh mục', value: product.category },
                      { label: 'Trọng lượng', value: product.weight ? `${product.weight} kg` : null },
                      { label: 'Kích thước', value: product.dimensions },
                      ...(product.attributes
                        ? Object.entries(product.attributes).map(([k, v]) => ({ label: k, value: v }))
                        : []),
                    ].filter(row => row.value).map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700/30' : 'bg-white dark:bg-slate-800'}>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 w-1/3 capitalize">{row.label}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!product.brand && !product.attributes && (
                  <p className="text-center text-slate-400 py-8 text-sm">Chưa có thông số kỹ thuật.</p>
                )}
              </div>
            )}

            {activeTab === 'Đánh giá & Nhận xét' && id && (
              <ReviewSection
                productId={id}
                ratingAvg={product.rating?.rate || 0}
                ratingCount={product.rating?.count || 0}
              />
            )}
          </div>
        </div>

        {/* ──── Related Products ──── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;