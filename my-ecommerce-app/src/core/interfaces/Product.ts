// ============================================
// Product Domain Types
// ============================================

export interface ProductRating {
  rate: number;
  count: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductVariant {
  id: number;
  variantType: string;  // e.g. "color", "size", "storage"
  variantValue: string; // e.g. "Red", "XL", "128GB"
  priceAdjustment?: number;
  stockQuantity?: number;
  sku?: string;
}

export interface Review {
  id: number;
  productId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: number;
  title: string;
  slug?: string;
  sku?: string;
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  stockQuantity: number;
  description: string;
  category: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  image: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  tags?: string[];
  rating: ProductRating;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields (for cart compatibility)
  sizes?: string[];
  colors?: string[];
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export interface ProductResponse {
  data: Product[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

export interface ReviewResponse {
  id: number;
  productId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  tags?: string[];
  minRating?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}