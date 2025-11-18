/**
 * API Service - Centralized HTTP client with axios
 */
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  DashboardStats,
  ConversationListResponse,
  ConversationDetailResponse,
  ProductListResponse,
  FAQListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  SendMessageRequest,
  TakeoverConversationRequest,
  UpdateBusinessSettingsRequest,
  ConversationFilters,
  ProductFilters,
  FAQFilters,
  APIResponse,
  Business,
  Product,
  FAQ,
} from '../types';

// API Base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class APIService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data.data;
        localStorage.setItem('token', token);
        return token;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // ============= Authentication =============

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  }

  async getMe(): Promise<APIResponse<{ business: Business }>> {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // ============= Dashboard =============

  async getDashboardStats(): Promise<APIResponse<DashboardStats>> {
    const response = await this.client.get('/api/dashboard/stats');
    return response.data;
  }

  // ============= Conversations =============

  async getConversations(filters?: ConversationFilters): Promise<ConversationListResponse> {
    const response = await this.client.get('/api/conversations', {
      params: filters,
    });
    return response.data;
  }

  async getConversationById(id: string): Promise<ConversationDetailResponse> {
    const response = await this.client.get(`/api/conversations/${id}`);
    return response.data;
  }

  async takeoverConversation(
    id: string,
    data?: TakeoverConversationRequest
  ): Promise<APIResponse> {
    const response = await this.client.patch(`/api/conversations/${id}/takeover`, data);
    return response.data;
  }

  async sendMessageToConversation(
    id: string,
    data: SendMessageRequest
  ): Promise<APIResponse> {
    const response = await this.client.post(`/api/conversations/${id}/messages`, data);
    return response.data;
  }

  async resolveConversation(id: string): Promise<APIResponse> {
    const response = await this.client.patch(`/api/conversations/${id}/resolve`);
    return response.data;
  }

  // ============= Products =============

  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const response = await this.client.get('/api/products', {
      params: filters,
    });
    return response.data;
  }

  async getProductById(id: string): Promise<APIResponse<Product>> {
    const response = await this.client.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(data: CreateProductRequest): Promise<APIResponse<Product>> {
    const response = await this.client.post('/api/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<APIResponse<Product>> {
    const response = await this.client.patch(`/api/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<APIResponse> {
    const response = await this.client.delete(`/api/products/${id}`);
    return response.data;
  }

  // ============= FAQs =============

  async getFAQs(filters?: FAQFilters): Promise<FAQListResponse> {
    const response = await this.client.get('/api/faqs', {
      params: filters,
    });
    return response.data;
  }

  async getFAQById(id: string): Promise<APIResponse<FAQ>> {
    const response = await this.client.get(`/api/faqs/${id}`);
    return response.data;
  }

  async createFAQ(data: CreateFAQRequest): Promise<APIResponse<FAQ>> {
    const response = await this.client.post('/api/faqs', data);
    return response.data;
  }

  async updateFAQ(id: string, data: UpdateFAQRequest): Promise<APIResponse<FAQ>> {
    const response = await this.client.patch(`/api/faqs/${id}`, data);
    return response.data;
  }

  async deleteFAQ(id: string): Promise<APIResponse> {
    const response = await this.client.delete(`/api/faqs/${id}`);
    return response.data;
  }

  // ============= Business Settings =============

  async updateBusinessSettings(
    data: UpdateBusinessSettingsRequest
  ): Promise<APIResponse<Business>> {
    const response = await this.client.patch('/api/business/settings', data);
    return response.data;
  }

  // ============= Analytics =============

  async getAIInteractionStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<APIResponse<any>> {
    const response = await this.client.get('/api/analytics/ai-interactions', {
      params,
    });
    return response.data;
  }
}

// Export singleton instance
export const api = new APIService();
export default api;
