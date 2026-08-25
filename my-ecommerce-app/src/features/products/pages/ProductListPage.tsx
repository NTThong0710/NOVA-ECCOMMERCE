import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '../../../hook/useServices';
import type { ProductFilters } from '../../../core/interfaces/Product';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating',    label: 'Đánh giá cao nhất' },
];

const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse">
    <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800" />
    <div className="pt-4 flex flex-col gap-2">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 w-1/3" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 w-3/4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 w-1/4 mt-1" />
    </div>
  </div>
);

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productService } = useServices();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Sync URL params -> filters on initial load
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat || q) setFilters(f => ({ ...f, category: cat || '', search: q || '' }));
  }, []); // eslint-disable-line

  // Fetch products
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', filters, sortBy],
    queryFn: () => productService.getProducts(filters),
    placeholderData: prev => prev,
  });

  // Fetch categories for sidebar
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  // Extract unique brands from loaded products (can't filter from backend if not supported)
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean) as string[]));

  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Update URL params
    const params: Record<string, string> = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.category) params.category = newFilters.category;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFiltersChange({ ...filters, search: searchInput, page: 1 });
  };

  const handleAddToCart = (product: any) => {
    toast.success(`Đã thêm "${product.title}" vào giỏ hàng!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc' },
    });
  };

  // Pagination helpers
  const goToPage = (p: number) => setFilters(f => ({ ...f, page: p }));
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const curr = filters.page ?? 1;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (curr > 3) pages.push('...');
      for (let i = Math.max(2, curr - 1); i <= Math.min(totalPages - 1, curr + 1); i++) pages.push(i);
      if (curr < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {filters.category ? (
              <span className="capitalize">{filters.category}</span>
            ) : filters.search ? (
              <>Kết quả tìm kiếm cho <span className="text-blue-600">"{filters.search}"</span></>
            ) : (
              'Tất cả sản phẩm'
            )}
          </h1>
          {totalElements > 0 && !isLoading && (
            <p className="text-sm text-slate-400 mt-1">{totalElements.toLocaleString()} sản phẩm</p>
          )}
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-9 pr-4 py-3 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:border-slate-900 dark:focus:border-white dark:text-slate-200 placeholder-slate-400 transition-colors"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-[#785A46] hover:bg-[#5C4033] text-white text-sm font-bold uppercase tracking-widest transition-colors">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop always visible, mobile drawer */}
          <div className={`
            lg:block lg:w-60 lg:flex-shrink-0
            ${sidebarOpen ? 'block' : 'hidden'}
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
            lg:bg-transparent
          `}>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="lg:relative fixed right-0 top-0 h-full lg:h-auto w-72 lg:w-full bg-white dark:bg-slate-800 lg:bg-transparent shadow-2xl lg:shadow-none overflow-y-auto lg:overflow-visible p-4 lg:p-0">
              {/* Mobile close */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Bộ lọc</h3>
                <button onClick={() => setSidebarOpen(false)}>
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterSidebar
                categories={categories}
                brands={brands}
                filters={filters}
                onFiltersChange={(f) => { handleFiltersChange(f); setSidebarOpen(false); }}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {isError ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">😕</div>
                <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Không thể tải sản phẩm</p>
                <p className="text-sm text-slate-400">Vui lòng thử lại sau</p>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                  {isLoading
                    ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
                    : products.length === 0
                      ? (
                        <div className="col-span-full text-center py-20">
                          <div className="text-5xl mb-4">🔍</div>
                          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Không tìm thấy sản phẩm</p>
                          <p className="text-sm text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                          <button onClick={() => handleFiltersChange({ page: 1, limit: 20 })} className="mt-4 px-6 py-3 bg-[#785A46] hover:bg-[#5C4033] text-white font-bold text-sm tracking-widest uppercase transition-colors">
                            Clear Filters
                          </button>
                        </div>
                      )
                      : products.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                      ))
                  }
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => goToPage((filters.page ?? 1) - 1)}
                      disabled={(filters.page ?? 1) <= 1}
                      className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {getPageNumbers().map((p, i) => (
                      p === '...'
                        ? <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm font-bold tracking-widest">...</span>
                        : (
                          <button
                            key={p}
                            onClick={() => goToPage(p as number)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors
                              ${filters.page === p
                                ? 'bg-[#785A46] text-white'
                                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                              }`}
                          >
                            {p}
                          </button>
                        )
                    ))}

                    <button
                      onClick={() => goToPage((filters.page ?? 1) + 1)}
                      disabled={(filters.page ?? 1) >= totalPages}
                      className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
