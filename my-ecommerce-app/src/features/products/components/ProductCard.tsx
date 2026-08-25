import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../../core/interfaces/Product';
import { useCartStore } from '../../cart/store/cartStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export const StarDisplay = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const stars = Math.round(rating);
  const sizeClass = size === 'md' ? 'text-lg' : 'text-xs';
  return (
    <div className={`flex text-amber-400 gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i key={s} className={`pi ${s <= stars ? 'pi-star-fill' : 'pi-star text-slate-200 dark:text-slate-700'}`} />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { t, i18n } = useTranslation();
  const addToCart = useCartStore(state => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [showCheck, setShowCheck] = useState(false);


  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product);
    if (onAddToCart) onAddToCart(product);
    setTimeout(() => { setIsAdding(false); setShowCheck(true); }, 400);
    setTimeout(() => setShowCheck(false), 2000);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col font-sans hover:-translate-y-1 transition-transform duration-500 cursor-pointer"
    >
      {/* Image Container */}
      <div className={`relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden ${isOutOfStock ? 'opacity-60' : ''}`}>
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover object-top mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/f1f5f9/94a3b8?text=NO+IMAGE'; }}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button (Hover) */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-sm"
          onClick={e => e.preventDefault()} // Not implemented yet
        >
          <i className="pi pi-heart text-sm text-slate-900"></i>
        </button>

        {/* Quick Add Button (Hover) */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
              isOutOfStock 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : showCheck
                  ? 'bg-green-500 text-white'
                  : 'bg-[#785A46]/90 hover:bg-[#5C4033] text-white backdrop-blur-md'
            }`}
          >
            {isAdding ? t('common.loading', 'Adding...') : showCheck ? `✓ ${t('common.success', 'Added')}` : t('product.add_to_cart', 'Quick Add')}
          </button>

        </div>
      </div>

      {/* Details */}
      <div className="pt-4 flex flex-col gap-1">
        {(product.brand || product.category) && (
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] truncate">
            {product.brand || product.category}
          </span>
        )}
        <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-red-600">
                {formatCurrency(product.discountPrice!, i18n.language)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price, i18n.language)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(product.price, i18n.language)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
