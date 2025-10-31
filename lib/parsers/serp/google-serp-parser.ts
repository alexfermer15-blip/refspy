import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { SerpResult } from '@/lib/types/parser.types';
import { RateLimiter } from '../core/rate-limiter';
import { ProxyManager } from '../utils/proxy-manager';

// Добавляем stealth plugin для Puppeteer
puppeteer.use(StealthPlugin());

export interface GoogleSerpOptions {
  keyword: string;
  location?: string;
  language?: string;
  resultsCount?: number;
  useProxy?: boolean;
  usePuppeteer?: boolean; // Новая опция для принудительного использования браузера
}

export class GoogleSerpParser {
  private rateLimiter: RateLimiter;
  private proxyManager: ProxyManager;

  constructor() {
    this.rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
    this.proxyManager = new ProxyManager();
  }

  async parseSerp(options: GoogleSerpOptions): Promise<SerpResult[]> {
    await this.rateLimiter.waitForSlot();

    const searchUrl = this.buildSearchUrl(options);
    console.log(`🔍 Searching: ${searchUrl}`);

    try {
      let html: string;
      
      // Если указано использовать Puppeteer или это повторная попытка после ошибки
      if (options.usePuppeteer) {
        console.log('🌐 Using Puppeteer with Stealth mode...');
        html = await this.fetchWithPuppeteer(searchUrl, options);
      } else {
        console.log('⚡ Using Axios (fast method)...');
        html = await this.fetchPage(searchUrl, options.useProxy);
      }

      const results = this.extractResults(html, searchUrl);

      // Если результатов нет и мы еще не пробовали Puppeteer - пробуем его
      if (results.length === 0 && !options.usePuppeteer) {
        console.log('⚠️ No results found, retrying with Puppeteer...');
        options.usePuppeteer = true;
        return await this.parseSerp(options);
      }

      console.log(`✅ Found ${results.length} organic results`);
      return results;
    } catch (error: any) {
      console.error('❌ Error in parseSerp:', error.message);
      
      // Если это была попытка с Axios, пробуем Puppeteer
      if (!options.usePuppeteer) {
        console.log('🔄 Fallback to Puppeteer...');
        options.usePuppeteer = true;
        return await this.parseSerp(options);
      }
      
      throw error;
    }
  }

  private buildSearchUrl(options: GoogleSerpOptions): string {
    const params = new URLSearchParams({
      q: options.keyword,
      num: String(options.resultsCount || 10),
      hl: options.language || 'en',
      gl: options.location || 'us',
      pws: '0', // Disable personalization
    });

    return `https://www.google.com/search?${params.toString()}`;
  }

  private async fetchPage(url: string, useProxy: boolean = false): Promise<string> {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    const config: any = {
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 30000,
      maxRedirects: 5,
    };

    if (useProxy) {
      const proxy = await this.proxyManager.getWorkingProxy();
      if (proxy) {
        config.proxy = {
          host: proxy.host,
          port: proxy.port,
        };
        console.log(`🔌 Using proxy: ${proxy.host}:${proxy.port}`);
      }
    }

    try {
      const response = await axios.get(url, config);
      
      // Сохраняем HTML для отладки в dev режиме
      if (process.env.NODE_ENV === 'development') {
        try {
          const fs = await import('fs/promises');
          await fs.writeFile('google-response-axios.html', response.data);
          console.log('📄 Saved response to google-response-axios.html');
          console.log(`📊 Response length: ${response.data.length} chars`);
          console.log(`📊 Status: ${response.status}`);
        } catch (e) {
          console.log('⚠️ Could not save debug file');
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching Google SERP:', error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Headers:`, error.response.headers);
      }
      throw error;
    }
  }

  private async fetchWithPuppeteer(url: string, options: GoogleSerpOptions): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    try {
      const page = await browser.newPage();

      // Устанавливаем viewport и user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Дополнительные меры против детекции
      await page.evaluateOnNewDocument(() => {
        // Скрываем webdriver
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });

        // Переопределяем permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: 'denied' } as PermissionStatus)
            : originalQuery(parameters);

        // Добавляем languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Добавляем plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      });

      console.log('🌐 Navigating to Google...');
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // ✅ ИСПРАВЛЕНО: Ждем появления результатов поиска
      try {
        await page.waitForSelector('.g, .Ww4FFb, .tF2Cxc', { timeout: 5000 });
        console.log('✅ Search results loaded');
      } catch (e) {
        console.log('⚠️ Results not found immediately, waiting 2 more seconds...');
        // Используем стандартный setTimeout с промисом вместо waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Делаем скриншот для отладки
      if (process.env.NODE_ENV === 'development') {
        try {
          await page.screenshot({ path: 'google-serp-debug.png', fullPage: true });
          console.log('📸 Screenshot saved: google-serp-debug.png');
        } catch (e) {
          console.log('⚠️ Could not save screenshot');
        }
      }

      const html = await page.content();

      // Сохраняем HTML для отладки
      if (process.env.NODE_ENV === 'development') {
        try {
          const fs = await import('fs/promises');
          await fs.writeFile('google-response-puppeteer.html', html);
          console.log('📄 Saved response to google-response-puppeteer.html');
          console.log(`📊 Response length: ${html.length} chars`);
        } catch (e) {
          console.log('⚠️ Could not save debug file');
        }
      }

      return html;
    } finally {
      await browser.close();
    }
  }

  private extractResults(html: string, searchUrl: string): SerpResult[] {
    const $ = cheerio.load(html);
    const results: SerpResult[] = [];

    console.log(`📄 HTML length: ${html.length} chars`);
    
    // Проверяем на CAPTCHA или блокировку
    if (html.includes('Our systems have detected unusual traffic') || 
        html.includes('captcha') ||
        html.length < 5000) {
      console.warn('⚠️ Possible CAPTCHA or blocking detected!');
      console.log(`   First 500 chars: ${html.substring(0, 500)}`);
    }

    // Расширенный список селекторов для разных версий Google
    const selectors = [
      '.g',                           // Классический
      '.Ww4FFb',                      // Новый
      '.tF2Cxc',                      // Контейнер результата
      '[data-sokoban-container]',     // Data-атрибут
      '.yuRUbf',                      // URL контейнер
      '.kvH3mc',                      // Мобильный
      'div.g',                        // С указанием div
      'div[data-hveid]',              // По data-атрибуту
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`🔍 Selector '${selector}' found ${elements.length} elements`);

      elements.each((index, element) => {
        const $element = $(element);

        // Пробуем разные варианты извлечения title
        let title = $element.find('h3').first().text().trim();
        if (!title) {
          title = $element.find('.DKV0Md').first().text().trim();
        }
        if (!title) {
          title = $element.find('[role="heading"]').first().text().trim();
        }

        // Пробуем разные варианты извлечения URL
        let link = $element.find('a').first().attr('href');
        if (!link) {
          link = $element.find('[href^="http"]').first().attr('href');
        }
        if (!link) {
          // Пытаемся найти ссылку в родительском элементе
          link = $element.closest('a').attr('href');
        }

        // Описание
        let description = $element.find('.VwiC3b').first().text().trim();
        if (!description) {
          description = $element.find('.yXK7lf').first().text().trim();
        }
        if (!description) {
          description = $element.find('.s').first().text().trim();
        }
        if (!description) {
          description = $element.find('.IsZvec').first().text().trim();
        }

        // Логируем для отладки (только первые 3)
        if (index < 3) {
          console.log(`  Item ${index + 1}:`);
          console.log(`    title: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`);
          console.log(`    link: "${link}"`);
        }

        // Фильтруем невалидные результаты
        if (!link || !title) return;
        if (link.startsWith('/search')) return; // Внутренняя ссылка Google
        if (link.startsWith('#')) return; // Якорная ссылка
        if (link.includes('google.com/search')) return; // Ссылка на поиск

        try {
          const url = new URL(link);
          const domain = url.hostname.replace('www.', '');

          // Пропускаем Google домены
          if (domain.includes('google.com') || domain.includes('youtube.com')) {
            return;
          }

          results.push({
            position: results.length + 1,
            url: link,
            domain,
            title,
            description,
            type: 'organic',
          });
        } catch (e) {
          console.log(`  ❌ Invalid URL: ${link}`);
        }
      });

      if (results.length > 0) {
        console.log(`✅ Successfully extracted ${results.length} results using selector: ${selector}`);
        break;
      }
    }

    // Если ничего не нашли - выводим больше отладочной информации
    if (results.length === 0) {
      console.error('❌ No results extracted! Debugging info:');
      console.log('   All h3 elements:', $('h3').length);
      console.log('   All links:', $('a').length);
      console.log('   Page title:', $('title').text());
      
      // Выводим первые найденные h3
      $('h3').slice(0, 5).each((i, el) => {
        console.log(`   h3[${i}]: "${$(el).text().trim()}"`);
      });
    }

    return results;
  }
}
