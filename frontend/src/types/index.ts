/**
 * TypeScript type definitions for WhatsApp AI Assistant Dashboard
 */

// ============= Core Entities =============

export interface Business {
  id: string;
  name: string;
  phone_number: string;
  location?: string;
  ai_tone: 'friendly' | 'formal' | 'custom';
  ai_custom_instructions?: string;
  ai_confidence_threshold: number;
  twilio_whatsapp_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  whatsapp_number: string;
  name?: string;
  metadata?: Record<string, any>;
  first_interaction_at: string;
  last_interaction_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  status: 'active' | 'escalated' | 'resolved';
  is_human_handled: boolean;
  human_takeover_at?: string;
  started_at: string;
  last_message_at: string;
  customer?: Customer; // Populated when fetched with relations
  messages?: Message[]; // Populated when fetched with messages
  message_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'ai' | 'human';
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  media_url?: string;
  twilio_message_sid?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: string; // Decimal as string
  currency: string;
  category?: string;
  stock_quantity?: number;
  image_url?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category?: string;
  priority: number;
  times_asked: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIInteraction {
  id: string;
  conversation_id: string;
  customer_message: string;
  ai_response: string;
  confidence_score: number;
  tools_used: string[];
  processing_time_ms: number;
  model_used: string;
  was_escalated: boolean;
  created_at: string;
}

export interface FollowUpQueue {
  id: string;
  business_id: string;
  customer_id: string;
  conversation_id: string;
  scheduled_for: string;
  message_template: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// ============= API Request/Response Types =============

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    business: Business;
  };
}

export interface DashboardStats {
  total_conversations: number;
  active_conversations: number;
  escalated_conversations: number;
  resolved_conversations: number;
  ai_handled_percentage: number;
  human_handled_percentage: number;
  average_response_time_ms: number;
  total_messages_today: number;
  total_customers: number;
  recent_conversations: Conversation[];
}

export interface ConversationListResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ConversationDetailResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
  };
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
  };
}

export interface FAQListResponse {
  success: boolean;
  data: {
    faqs: FAQ[];
    total: number;
  };
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: string;
  currency: string;
  category?: string;
  stock_quantity?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category?: string;
  priority?: number;
  is_active?: boolean;
}

export interface UpdateFAQRequest extends Partial<CreateFAQRequest> {}

export interface SendMessageRequest {
  content: string;
  message_type?: 'text' | 'image' | 'document';
  media_url?: string;
}

export interface TakeoverConversationRequest {
  reason?: string;
}

export interface UpdateBusinessSettingsRequest {
  name?: string;
  location?: string;
  ai_tone?: 'friendly' | 'formal' | 'custom';
  ai_custom_instructions?: string;
  ai_confidence_threshold?: number;
}

// ============= UI State Types =============

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  business: Business | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export interface UIState {
  sidebarOpen: boolean;
  selectedConversationId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedConversation: (id: string | null) => void;
}

// ============= Filter/Query Types =============

export interface ConversationFilters {
  status?: 'active' | 'escalated' | 'resolved';
  is_human_handled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  category?: string;
  is_active?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface FAQFilters {
  category?: string;
  is_active?: boolean;
  search?: string;
}

// ============= Utility Types =============

export type ConversationStatus = 'active' | 'escalated' | 'resolved';
export type MessageSenderType = 'customer' | 'ai' | 'human';
export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video';
export type AITone = 'friendly' | 'formal' | 'custom';
export type FollowUpStatus = 'pending' | 'sent' | 'failed';

export interface APIError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface APISuccess<T = any> {
  success: true;
  data: T;
}

export type APIResponse<T = any> = APISuccess<T> | APIError;
