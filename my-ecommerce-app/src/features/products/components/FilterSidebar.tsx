import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductFilters } from '../../../core/interfaces/Product';
import { useCurrencyStore } from '../../../core/store/currencyStore';

interface FilterSidebarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: string[];
  brands: string[];
}

const STAR_OPTIONS = [4, 3, 2, 1];

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFiltersChange, categories, brands }) => {
  const { t } = useTranslation();
  const { currency, exchangeRate, toDisplayAmount, toUSD } = useCurrencyStore();

  // Local display price in current currency
  const [displayMin, setDisplayMin] = useState<number | ''>(
    filters.minPrice != null ? Math.round(toDisplayAmount(filters.minPrice)) : ''
  );
  const [displayMax, setDisplayMax] = useState<number | ''>(
    filters.maxPrice != null ? Math.round(toDisplayAmount(filters.maxPrice)) : ''
  );

  // Sync display inputs when currency or external filters change
  useEffect(() => {
    setDisplayMin(filters.minPrice != null ? Math.round(toDisplayAmount(filters.minPrice)) : '');
    setDisplayMax(filters.maxPrice != null ? Math.round(toDisplayAmount(filters.maxPrice)) : '');
  }, [currency, filters.minPrice, filters.maxPrice]);

  const update = (updates: Partial<ProductFilters>) => {
    onFiltersChange({ ...filters, ...updates, page: 1 });
  };

  const applyCustomPrice = () => {
    const minUSD = displayMin !== '' && displayMin >= 0 ? toUSD(Number(displayMin)) : undefined;
    const maxUSD = displayMax !== '' && displayMax > 0 ? toUSD(Number(displayMax)) : undefined;
    update({ minPrice: minUSD, maxPrice: maxUSD });
  };

  const applyQuickPriceUSD = (min?: number, max?: number) => {
    setDisplayMin(min != null ? Math.round(toDisplayAmount(min)) : '');
    setDisplayMax(max != null ? Math.round(toDisplayAmount(max)) : '');
    update({ minPrice: min, maxPrice: max });
  };

  const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full py-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white transition-colors">
          {title}
          <ChevronIcon open={open} />
        </button>
        {open && <div className="mt-2">{children}</div>}
      </div>
    );
  };

  const toggleBrand = (brand: string) => {
    const current = filters.brands || [];
    const next = current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand];
    update({ brands: next });
  };

  const clearAll = () => {
    setDisplayMin('');
    setDisplayMax('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters = !!(filters.category || filters.minPrice != null || filters.maxPrice != null || filters.brands?.length || filters.minRating);

  // Quick price definitions in USD (backend storage unit)
  const quickPrices = currency === 'VND' ? [
    { label: t('filter.quick_vnd_1', 'Dưới 500K'), minUSD: 0, maxUSD: 500000 / exchangeRate },
    { label: t('filter.quick_vnd_2', '500K - 1.5M'), minUSD: 500000 / exchangeRate, maxUSD: 1500000 / exchangeRate },
    { label: t('filter.quick_vnd_3', '1.5M - 3M'), minUSD: 1500000 / exchangeRate, maxUSD: 3000000 / exchangeRate },
    { label: t('filter.quick_vnd_4', 'Trên 3M'), minUSD: 3000000 / exchangeRate, maxUSD: 100000000 / exchangeRate },
  ] : [
    { label: t('filter.quick_usd_1', 'Under $25'), minUSD: 0, maxUSD: 25 },
    { label: t('filter.quick_usd_2', '$25 - $50'), minUSD: 25, maxUSD: 50 },
    { label: t('filter.quick_usd_3', '$50 - $100'), minUSD: 50, maxUSD: 100 },
    { label: t('filter.quick_usd_4', 'Over $100'), minUSD: 100, maxUSD: 10000 },
  ];

  return (
    <aside className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-black tracking-widest uppercase text-slate-900 dark:text-white flex items-center gap-2">
          {t('filter.title', 'Bộ Lọc')}
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-[#785A46] hover:text-[#5C4033] font-bold uppercase tracking-wider transition-colors">
            {t('filter.clear_all', 'Xóa tất cả')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Category */}
        <FilterSection title={t('filter.categories', 'Danh Mục')}>
          <div className="space-y-1">
            <button
              onClick={() => update({ category: '' })}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${!filters.category ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {t('filter.all_categories', 'Tất cả danh mục')}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => update({ category: filters.category === cat ? '' : cat })}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${filters.category === cat ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title={`${t('filter.price', 'Khoảng Giá')} (${currency})`}>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  value={displayMin}
                  onChange={e => setDisplayMin(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 transition-colors"
                  min={0}
                  placeholder={`Min (${currency === 'VND' ? '₫' : '$'})`}
                />
              </div>
              <span className="text-slate-400 font-bold">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={displayMax}
                  onChange={e => setDisplayMax(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#785A46]/30 transition-colors"
                  min={0}
                  placeholder={`Max (${currency === 'VND' ? '₫' : '$'})`}
                />
              </div>
            </div>
            <button
              onClick={applyCustomPrice}
              className="w-full py-2.5 bg-[#785A46] hover:bg-[#5C4033] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95"
            >
              {t('filter.apply_filter', 'Áp Dụng Lọc Giá')}
            </button>

            {/* Quick price options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {quickPrices.map(opt => {
                const isActive = filters.minPrice != null && Math.abs(filters.minPrice - opt.minUSD) < 0.5 &&
                                 filters.maxPrice != null && Math.abs(filters.maxPrice - opt.maxUSD) < 0.5;
                return (
                  <button
                    key={opt.label}
                    onClick={() => applyQuickPriceUSD(opt.minUSD, opt.maxUSD)}
                    className={`px-2 py-2 text-xs font-bold rounded-xl border transition-all
                      ${isActive
                        ? 'border-[#785A46] bg-[#785A46] text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#785A46] hover:text-[#785A46]'
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Brand */}
        {brands.length > 0 && (
          <FilterSection title={t('filter.brand', 'Thương Hiệu')} defaultOpen={false}>
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.brands?.includes(brand) ?? false}
                    onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 rounded accent-[#785A46] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-[#785A46] transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Rating */}
        <FilterSection title={t('filter.rating', 'Đánh Giá')} defaultOpen={false}>
          <div className="space-y-1 pt-2">
            <button
              onClick={() => update({ minRating: undefined })}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${!filters.minRating ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {t('filter.all_ratings', 'Tất cả đánh giá')}
            </button>
            {STAR_OPTIONS.map(star => (
              <button
                key={star}
                onClick={() => update({ minRating: filters.minRating === star ? undefined : star })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${filters.minRating === star ? 'bg-[#785A46] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`pi ${i < star ? 'pi-star-fill text-amber-400' : 'pi-star text-slate-300 dark:text-slate-600'} text-xs`}></i>
                  ))}
                </div>
                <span>{star} {t('filter.and_up', 'sao trở lên')}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;

