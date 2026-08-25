import type { Product, ProductResponse, ReviewResponse, ProductFilters } from './Product';

export interface IProductService {
  getProducts(filtersOrSearch?: ProductFilters | string, category?: string, page?: number, limit?: number): Promise<ProductResponse>;
  getProductById(id: string | number): Promise<Product>;
  getRelatedProducts(id: string | number): Promise<Product[]>;
  getCategories(): Promise<string[]>;
  getProductReviews(productId: string | number, page?: number, limit?: number): Promise<{ content: ReviewResponse[]; totalPages: number; totalElements: number }>;
  addReview(productId: string | number, data: { rating: number; comment: string; username: string }): Promise<ReviewResponse>;
  searchProducts(query: string, page?: number, limit?: number): Promise<ProductResponse>;
}
