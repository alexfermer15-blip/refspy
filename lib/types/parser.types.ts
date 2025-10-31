export interface Proxy {
  host: string;
  port: number;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  country?: string;
  speed?: number;
  lastChecked?: Date;
  isWorking: boolean;
}

export interface ProxySource {
  name: string;
  url: string;
  format: 'text' | 'json' | 'csv';
  type: 'http' | 'https' | 'socks4' | 'socks5';
}

export interface SerpResult {
  position: number;
  url: string;
  domain: string;
  title: string;
  description: string;
  type: 'organic' | 'featured' | 'ads';
}

export interface BacklinkResult {
  source_url: string;
  source_domain: string;
  target_url: string;
  anchor_text: string;
  link_type: 'dofollow' | 'nofollow';
  found_date: string;
}

export interface DomainMetrics {
  domain: string;
  domain_authority: number;
  page_authority: number;
  backlinks_count: number;
  referring_domains: number;
  trust_score: number;
  spam_score: number;
}

export interface CompetitorAnalysis {
  domain: string;
  url: string;
  position: number;
  title: string;
  description: string;
  metrics: DomainMetrics | null;
  backlinks: BacklinkResult[];
}
