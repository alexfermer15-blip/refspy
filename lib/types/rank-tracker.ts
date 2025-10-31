// lib/types/rank-tracker.ts
export interface Keyword {
  id: string;
  user_id: string;
  project_id?: string;
  keyword: string;
  target_url: string;
  search_engine: 'google' | 'yandex' | 'bing';
  location: string;
  language: string;
  device: 'desktop' | 'mobile' | 'tablet';
  is_active: boolean;
  check_frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface RankHistory {
  id: string;
  keyword_id: string;
  position: number | null;
  previous_position: number | null;
  position_change: number | null;
  page_number: number | null;
  url_found: string | null;
  title: string | null;
  description: string | null;
  search_volume: number | null;
  cpc: number | null;
  competition: number | null;
  checked_at: string;
  created_at: string;
}

export interface RankAlert {
  id: string;
  keyword_id: string;
  alert_type: 'position_drop' | 'position_increase' | 'out_of_top_10' | 'entered_top_3';
  threshold: number | null;
  is_enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeywordWithHistory extends Keyword {
  latest_position?: RankHistory;
  history?: RankHistory[];
}
