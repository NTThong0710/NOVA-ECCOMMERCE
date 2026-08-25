import type { ApiClient } from '../../../core/interfaces/ApiClient';
import type { Product, ProductResponse, ReviewResponse, ProductFilters } from '../../../core/interfaces/Product';

export class ProductService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getProducts(filters: ProductFilters | string = '', category: string = '', page: number = 1, limit: number = 20): Promise<ProductResponse> {
    // Support both old call signature and new filter object
    if (typeof filters === 'string') {
      const params = new URLSearchParams({
        search: filters,
        category,
        page: String(page),
        limit: String(limit),
      });
      return this.apiClient.get<ProductResponse>(`/products?${params}`);
    }

    const params = new URLSearchParams();
    if (filters.search)    params.set('search', filters.search);
    if (filters.category)  params.set('category', filters.category);
    if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
    if (filters.brands?.length)   filters.brands.forEach(b => params.append('brands', b));
    if (filters.tags?.length)     filters.tags.forEach(t => params.append('tags', t));
    params.set('page', String(filters.page ?? 1));
    params.set('limit', String(filters.limit ?? 20));

    return this.apiClient.get<ProductResponse>(`/products?${params}`);
  }

  async getProductById(id: string | number): Promise<Product> {
    return this.apiClient.get<Product>(`/products/${id}`);
  }

  async getRelatedProducts(id: string | number): Promise<Product[]> {
    return this.apiClient.get<Product[]>(`/products/${id}/related`);
  }

  async getCategories(): Promise<string[]> {
    return this.apiClient.get<string[]>('/products/categories');
  }

  async getProductReviews(productId: string | number, page: number = 1, limit: number = 10): Promise<{ content: ReviewResponse[]; totalPages: number; totalElements: number }> {
    return this.apiClient.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
  }

  async addReview(productId: string | number, data: { rating: number; comment: string; username: string }): Promise<ReviewResponse> {
    return this.apiClient.post<ReviewResponse>(`/products/${productId}/reviews`, data);
  }

  async searchProducts(query: string, page: number = 0, limit: number = 10): Promise<ProductResponse> {
    return this.apiClient.get<ProductResponse>(`/products/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }
}