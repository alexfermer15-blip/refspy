import axios from 'axios';
import { SerpResult } from '@/lib/types/parser.types';
import { RateLimiter } from '../core/rate-limiter';
import { CacheManager } from '../core/cache-manager';

// Динамический импорт Puppeteer только когда нужно
let puppeteerInstance: any = null;

// Загружаем .env.local для скриптов
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  } catch (e) {
    // Игнорируем
  }
}

export interface HybridSerpOptions {
  keyword: string;
  location?: string;
  language?: string;
  resultsCount?: number;
  forceMethod?: 'google-cse' | 'puppeteer';
}

interface PuppeteerResult {
  title: string;
  url: string;
  description: string;
}

export class GoogleSerpHybrid {
  private rateLimiter: RateLimiter;
  private cache: CacheManager;
  private googleCSEKey: string;
  private googleCSEId: string;
  private googleCSEUsage: number = 0;
  private readonly GOOGLE_CSE_DAILY_LIMIT = 100;

  constructor() {
    this.rateLimiter = new RateLimiter(2, 1000);
    this.cache = new CacheManager();
    this.googleCSEKey = process.env.GOOGLE_CSE_API_KEY || '';
    this.googleCSEId = process.env.GOOGLE_CSE_ID || '';
  }

  /**
   * Главный метод - автоматически выбирает лучший способ
   */
  async search(options: HybridSerpOptions): Promise<SerpResult[]> {
    await this.rateLimiter.waitForSlot();

    const cacheKey = `serp:${options.keyword}:${options.location || 'us'}`;
    
    // 1. Проверяем кэш
    const cached = await this.cache.get<SerpResult[]>(cacheKey);
    if (cached) {
      console.log('💾 Using cached results');
      return cached;
    }

    let results: SerpResult[] = [];

    // 2. Выбираем метод
    if (options.forceMethod === 'puppeteer') {
      console.log('🌐 Forced Puppeteer mode');
      results = await this.searchWithPuppeteer(options);
    } else if (options.forceMethod === 'google-cse') {
      console.log('🔑 Forced Google CSE mode');
      results = await this.searchWithGoogleCSE(options);
    } else {
      results = await this.autoSearch(options);
    }

    // 3. Кэшируем результаты на 24 часа
    if (results.length > 0) {
      await this.cache.set(cacheKey, results, 86400);
    }

    return results;
  }

  /**
   * Автоматический выбор лучшего метода
   */
  private async autoSearch(options: HybridSerpOptions): Promise<SerpResult[]> {
    // Приоритет 1: Google Custom Search API (если есть квота)
    if (this.canUseGoogleCSE()) {
      try {
        console.log('🔑 Trying Google Custom Search API...');
        const results = await this.searchWithGoogleCSE(options);
        if (results.length > 0) {
          return results;
        }
      } catch (error: any) {
        console.log('⚠️ Google CSE failed:', error.message);
      }
    }

    // Приоритет 2: Puppeteer Stealth (запасной вариант)
    console.log('🌐 Fallback to Puppeteer Stealth...');
    return await this.searchWithPuppeteer(options);
  }

  /**
   * Метод 1: Google Custom Search API
   */
  private async searchWithGoogleCSE(options: HybridSerpOptions): Promise<SerpResult[]> {
    if (!this.googleCSEKey || !this.googleCSEId) {
      throw new Error('Google CSE credentials not configured');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.googleCSEKey);
    url.searchParams.set('cx', this.googleCSEId);
    url.searchParams.set('q', options.keyword);
    url.searchParams.set('num', String(options.resultsCount || 10));
    
    if (options.location) {
      url.searchParams.set('gl', options.location);
    }
    if (options.language) {
      url.searchParams.set('lr', `lang_${options.language}`);
    }

    try {
      const response = await axios.get(url.toString(), { timeout: 10000 });
      
      this.googleCSEUsage++;
      console.log(`✅ Google CSE success (${this.googleCSEUsage}/${this.GOOGLE_CSE_DAILY_LIMIT} used today)`);

      const items = response.data.items || [];
      
      return items.map((item: any, index: number) => ({
        position: index + 1,
        url: item.link,
        domain: new URL(item.link).hostname.replace('www.', ''),
        title: item.title,
        description: item.snippet || '',
        type: 'organic' as const,
      }));
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('❌ Google CSE quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Метод 2: Puppeteer Stealth (динамическая загрузка)
   */
  private async searchWithPuppeteer(options: HybridSerpOptions): Promise<SerpResult[]> {
    // Динамически загружаем Puppeteer только когда нужно
    if (!puppeteerInstance) {
      try {
        const puppeteerExtra = await import('puppeteer-extra');
        const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
        
        puppeteerExtra.default.use(StealthPlugin());
        puppeteerInstance = puppeteerExtra.default;
      } catch (error) {
        console.error('Failed to load Puppeteer:', error);
        throw new Error('Puppeteer not available');
      }
    }

    const browser = await puppeteerInstance.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });

    try {
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Скрываем автоматизацию
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      const searchUrl = this.buildGoogleUrl(options);
      console.log(`🌐 Navigating to: ${searchUrl}`);

      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Ждем результаты
      try {
        await page.waitForSelector('.g, .tF2Cxc', { timeout: 10000 });
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Извлекаем результаты
      const results = await page.evaluate(() => {
        const items: any[] = [];
        const selectors = ['.g', '.tF2Cxc', '.Ww4FFb'];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          
          elements.forEach((el) => {
            const titleEl = el.querySelector('h3');
            const linkEl = el.querySelector('a');
            const descEl = el.querySelector('.VwiC3b, .yXK7lf');

            if (titleEl && linkEl && linkEl.href) {
              const url = linkEl.href;
              // Фильтруем Google ссылки
              if (!url.includes('google.com/search') && !url.startsWith('#')) {
                items.push({
                  title: titleEl.textContent?.trim() || '',
                  url: url,
                  description: descEl?.textContent?.trim() || '',
                });
              }
            }
          });

          if (items.length > 0) break;
        }

        return items;
      });

      console.log(`✅ Puppeteer extracted ${results.length} results`);

      // ✅ Исправлено: явные типы для параметров
      return results.map((item: PuppeteerResult, index: number): SerpResult => ({
        position: index + 1,
        url: item.url,
        domain: new URL(item.url).hostname.replace('www.', ''),
        title: item.title,
        description: item.description,
        type: 'organic' as const,
      }));

    } finally {
      await browser.close();
    }
  }

  /**
   * Проверка доступности Google CSE
   */
  private canUseGoogleCSE(): boolean {
    if (!this.googleCSEKey || !this.googleCSEId) {
      return false;
    }
    if (this.googleCSEUsage >= this.GOOGLE_CSE_DAILY_LIMIT) {
      console.log('⚠️ Google CSE daily limit reached');
      return false;
    }
    return true;
  }

  /**
   * Построение URL для Google поиска
   */
  private buildGoogleUrl(options: HybridSerpOptions): string {
    const params = new URLSearchParams({
      q: options.keyword,
      num: String(options.resultsCount || 10),
      hl: options.language || 'en',
      gl: options.location || 'us',
      pws: '0',
    });

    return `https://www.google.com/search?${params.toString()}`;
  }

  /**
   * Статистика использования
   */
  getUsageStats() {
    return {
      googleCSE: {
        used: this.googleCSEUsage,
        limit: this.GOOGLE_CSE_DAILY_LIMIT,
        remaining: this.GOOGLE_CSE_DAILY_LIMIT - this.googleCSEUsage,
        percentage: (this.googleCSEUsage / this.GOOGLE_CSE_DAILY_LIMIT * 100).toFixed(1) + '%',
      },
      cache: this.cache.getStats(),
    };
  }

  /**
   * Сброс счетчика (вызывается раз в день)
   */
  resetDailyUsage() {
    this.googleCSEUsage = 0;
    console.log('🔄 Daily usage counter reset');
  }
}
