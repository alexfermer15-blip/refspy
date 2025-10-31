// lib/types/index.ts

// ========================================
// ЭКСПОРТ БАЗОВЫХ ТИПОВ ИЗ DATABASE
// ========================================
export type {
  User,
  Project,
  Competitor,
  Backlink,
  AnalysisResult,
  Notification,
  ActivityLog,
  Settings
} from './database'

// ========================================
// INPUT ТИПЫ (для создания)
// ========================================

// User Input
export interface CreateUserInput {
  email: string
  full_name?: string
  avatar_url?: string
}

// Project Input
export interface CreateProjectInput {
  name: string
  keyword: string
  domain?: string
  region: string
  depth: number
}

export interface UpdateProjectInput {
  name?: string
  keyword?: string
  domain?: string
  region?: string
  depth?: number
  status?: 'draft' | 'analyzing' | 'active' | 'completed' | 'paused'
}

// Competitor Input
export interface CreateCompetitorInput {
  project_id: string
  domain: string
  position: number
  url: string
  title?: string
  description?: string
  snippet?: string
  dr?: number
  da?: number
  traffic?: number  // ✅ ДОБАВЛЕНО
  backlinks_count?: number
  referring_domains?: number
  organic_traffic?: number
}

export interface UpdateCompetitorInput {
  domain?: string
  position?: number
  url?: string
  title?: string
  description?: string
  snippet?: string
  dr?: number
  da?: number
  traffic?: number
  backlinks_count?: number
  referring_domains?: number
  organic_traffic?: number
  is_selected?: boolean
}

// Backlink Input
export interface CreateBacklinkInput {
  project_id: string
  competitor_id?: string
  source_domain: string
  source_url: string
  target_url: string
  anchor_text?: string
  link_type: 'dofollow' | 'nofollow'
  dr?: number
  da?: number
  traffic?: number
  spam_score?: number
  is_available?: boolean
}

export interface UpdateBacklinkInput {
  source_domain?: string
  source_url?: string
  target_url?: string
  anchor_text?: string
  link_type?: 'dofollow' | 'nofollow'
  dr?: number
  da?: number
  traffic?: number
  spam_score?: number
  is_available?: boolean
  checked_at?: string
}

// Settings Input
export interface UpdateSettingsInput {
  notifications_enabled?: boolean
  email_notifications?: boolean
  theme?: 'dark' | 'light' | 'system'
  language?: 'en' | 'ru'
  timezone?: string
}

// ========================================
// DATA ТИПЫ (для API)
// ========================================

// Project Data (с user_id и status для создания)
export interface CreateProjectData extends CreateProjectInput {
  user_id: string
  status: 'draft' | 'analyzing' | 'active' | 'completed' | 'paused'
}

// Competitor Data (с is_selected)
export interface CreateCompetitorData extends CreateCompetitorInput {
  is_selected?: boolean
}

// Backlink Data
export interface CreateBacklinkData extends CreateBacklinkInput {
  discovered_at?: string
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
// ========================================

// Sort Order
export type SortOrder = 'asc' | 'desc'

// Subscription Tiers
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'

// Project Status
export type ProjectStatus = 'draft' | 'analyzing' | 'active' | 'completed' | 'paused'

// Link Type
export type LinkType = 'dofollow' | 'nofollow'

// Notification Type
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// ========================================
// API RESPONSE ТИПЫ
// ========================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: SortOrder
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ========================================
// STATS ТИПЫ
// ========================================

export interface ProjectStats {
  total: number
  active: number
  analyzing: number
  completed: number
  paused: number
}

export interface BacklinkStats {
  total: number
  dofollow: number
  nofollow: number
  avgDR: number
  highDR: number
  available: number
}

export interface CompetitorStats {
  total: number
  selected: number
  avgDR: number
  avgPosition: number
}

// ========================================
// PAYMENT ТИПЫ (для будущей интеграции)
// ========================================

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  created_at: string
}

export interface RankTracking {
  id: string
  project_id: string
  keyword: string
  position: number
  url: string
  search_engine: string
  location: string
  checked_at: string
  created_at: string
}

export interface Integration {
  id: string
  user_id: string
  type: 'google_analytics' | 'google_search_console' | 'ahrefs' | 'semrush'
  credentials: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}
