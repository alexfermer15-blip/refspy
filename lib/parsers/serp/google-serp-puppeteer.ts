import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { SerpResult } from '@/lib/types/parser.types';

puppeteer.use(StealthPlugin());

export class GoogleSerpPuppeteer {
  async parseSerp(keyword: string, options: any = {}): Promise<SerpResult[]> {
    console.log('🚀 Launching browser with stealth mode...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const page = await browser.newPage();
    
    // Устанавливаем viewport и user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Переходим на Google
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=${options.resultsCount || 10}`;
    console.log(`🔍 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Делаем скриншот для отладки
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ path: 'google-serp-debug.png' });
      console.log('📸 Screenshot saved: google-serp-debug.png');
    }

    // Извлекаем результаты
    const results = await page.evaluate(() => {
      const items: any[] = [];
      
      // Пробуем разные селекторы
      const selectors = ['.g', '.Ww4FFb', '.tF2Cxc'];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((el, index) => {
          const titleEl = el.querySelector('h3');
          const linkEl = el.querySelector('a');
          const descEl = el.querySelector('.VwiC3b, .yXK7lf, .s');
          
          if (titleEl && linkEl) {
            items.push({
              position: items.length + 1,
              title: titleEl.textContent?.trim() || '',
              url: linkEl.getAttribute('href') || '',
              description: descEl?.textContent?.trim() || '',
            });
          }
        });
        
        if (items.length > 0) break;
      }
      
      return items;
    });

    await browser.close();
    
    console.log(`✅ Found ${results.length} results with Puppeteer`);

    return results.map(r => ({
      ...r,
      domain: new URL(r.url).hostname.replace('www.', ''),
      type: 'organic' as const,
    }));
  }
}
