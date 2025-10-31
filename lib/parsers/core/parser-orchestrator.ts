import { GoogleSerpHybrid, HybridSerpOptions } from '../serp/google-serp-hybrid';
import { CacheManager } from './cache-manager';
import { CompetitorAnalysis } from '@/lib/types/parser.types';

export interface AnalysisRequest {
  keyword: string;
  location?: string;
  language?: string;
  competitorsCount?: number;
  forceMethod?: 'google-cse' | 'puppeteer';
}

export class ParserOrchestrator {
  private serpParser: GoogleSerpHybrid;
  private cache: CacheManager;

  constructor() {
    this.serpParser = new GoogleSerpHybrid();
    this.cache = new CacheManager();
  }

  async analyzeCompetitors(request: AnalysisRequest): Promise<CompetitorAnalysis[]> {
    console.log(`\n🚀 Starting competitor analysis for "${request.keyword}"`);
    
    // Используем гибридный парсер
    const serpResults = await this.serpParser.search({
      keyword: request.keyword,
      location: request.location || 'us',
      language: request.language || 'en',
      resultsCount: request.competitorsCount || 10,
      forceMethod: request.forceMethod,
    });

    // Трансформируем в CompetitorAnalysis
    const analyses: CompetitorAnalysis[] = serpResults.map(result => ({
      domain: result.domain,
      url: result.url,
      position: result.position,
      title: result.title,
      description: result.description,
      metrics: null,
      backlinks: [],
    }));

    console.log(`✅ Analysis completed for ${analyses.length} competitors\n`);
    
    return analyses;
  }

  /**
   * Получить статистику использования
   */
  getStats() {
    return this.serpParser.getUsageStats();
  }
}
