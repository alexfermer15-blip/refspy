// lib/types.ts

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  keyword: string
  domain?: string
  region: string
  depth: number
  status: 'active' | 'analyzing' | 'completed' | 'paused'
  created_at?: string
  updated_at?: string
}

export interface Competitor {
  id: string
  project_id: string
  domain: string
  position: number
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
  is_selected: boolean
  created_at?: string
  updated_at?: string
}

export interface Backlink {
  id: string
  project_id: string
  competitor_id: string
  source_domain: string
  source_url: string
  target_url: string
  anchor_text?: string
  link_type?: 'dofollow' | 'nofollow'
  dr?: number
  da?: number
  traffic?: number
  spam_score?: number
  is_available?: boolean
  is_selected?: boolean
  discovered_at?: string
  created_at?: string
}

export interface Settings {
  id: string
  user_id: string
  language: 'en' | 'ru'
  theme: 'light' | 'dark'
  notifications_enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateProjectData {
  user_id: string
  name: string
  keyword: string
  domain?: string
  region: string
  depth: number
  status: 'active' | 'analyzing' | 'completed' | 'paused'
}

export interface ProjectStats {
  total: number
  active: number
  analyzing: number
  completed: number
  paused: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}
