// lib/types/database.ts

// User
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
  credits: number
  created_at: string
  updated_at: string
}

// Project
export interface Project {
  id: string
  user_id: string
  name: string
  keyword: string
  domain?: string
  region: string
  depth: number
  status: 'draft' | 'analyzing' | 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

// Competitor
export interface Competitor {
  id: string
  project_id: string
  domain: string
  position: number
  url: string
  title?: string
  description?: string
  snippet?: string
  dr?: number
  da?: number
  backlinks_count: number
  referring_domains: number
  organic_traffic?: number
  is_selected: boolean
  created_at: string
  updated_at: string
}

// Backlink
export interface Backlink {
  id: string
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
  is_available: boolean
  discovered_at: string
  checked_at?: string
  created_at: string
}

// Analysis Result
export interface AnalysisResult {
  id: string
  project_id: string
  total_competitors: number
  total_backlinks: number
  avg_dr: number
  avg_da: number
  top_domains: string[]
  completed_at: string
  created_at: string
}

// Notification
export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

// Activity Log
export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: 'project' | 'competitor' | 'backlink' | 'user'
  entity_id: string
  metadata?: Record<string, any>
  created_at: string
}

// Settings
export interface Settings {
  id: string
  user_id: string
  notifications_enabled: boolean
  email_notifications: boolean
  theme: 'dark' | 'light' | 'system'
  language: 'en' | 'ru'
  timezone: string
  created_at: string
  updated_at: string
}
