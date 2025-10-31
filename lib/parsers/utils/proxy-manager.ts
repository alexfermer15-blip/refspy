import axios from 'axios';
import { Proxy, ProxySource } from '@/lib/types/parser.types';
import { FREE_PROXY_SOURCES } from './free-proxy-sources';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

export class ProxyManager {
  private proxies: Proxy[] = [];
  private workingProxies: Proxy[] = [];
  private currentIndex: number = 0;
  private isLoaded: boolean = false;

  async loadProxies(): Promise<void> {
    console.log('🔄 Loading proxies from free sources...');
    
    const allProxies: Proxy[] = [];

    for (const source of FREE_PROXY_SOURCES) {
      try {
        const proxies = await this.fetchFromSource(source);
        allProxies.push(...proxies);
        console.log(`✅ Loaded ${proxies.length} proxies from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error loading from ${source.name}`);
      }
    }

    this.proxies = this.removeDuplicates(allProxies);
    console.log(`📊 Total unique proxies: ${this.proxies.length}`);

    // Проверяем первые 200 прокси для быстрого старта
    await this.checkProxies(this.proxies.slice(0, 200));
    this.isLoaded = true;
    console.log(`✅ Working proxies: ${this.workingProxies.length}`);
  }

  private async fetchFromSource(source: ProxySource): Promise<Proxy[]> {
    try {
      const response = await axios.get(source.url, { timeout: 10000 });
      
      if (source.format === 'text') {
        return this.parseTextFormat(response.data, source.type);
      } else if (source.format === 'json') {
        return this.parseJsonFormat(response.data, source.type);
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
    
    return [];
  }

  private parseTextFormat(data: string, type: string): Proxy[] {
    const lines = data.split('\n').filter(line => line.trim());
    const proxies: Proxy[] = [];

    for (const line of lines) {
      const [host, port] = line.trim().split(':');
      if (host && port && !isNaN(parseInt(port))) {
        proxies.push({
          host,
          port: parseInt(port),
          type: type as any,
          isWorking: false,
        });
      }
    }

    return proxies;
  }

  private parseJsonFormat(data: any, type: string): Proxy[] {
    const proxies: Proxy[] = [];

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        proxies.push({
          host: item.ip,
          port: parseInt(item.port),
          type: type as any,
          country: item.country,
          isWorking: false,
        });
      }
    }

    return proxies;
  }

  private removeDuplicates(proxies: Proxy[]): Proxy[] {
    const seen = new Set<string>();
    return proxies.filter(proxy => {
      const key = `${proxy.host}:${proxy.port}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async checkProxies(proxies: Proxy[]): Promise<void> {
    console.log(`🔍 Checking ${proxies.length} proxies...`);
    
    const checkPromises = proxies.map(proxy => this.checkProxy(proxy));
    const results = await Promise.allSettled(checkPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        this.workingProxies.push(proxies[index]);
      }
    });

    this.workingProxies.sort((a, b) => (a.speed || 999999) - (b.speed || 999999));
  }

  private async checkProxy(proxy: Proxy): Promise<boolean> {
    const testUrl = 'https://httpbin.org/ip';
    const timeout = 5000;

    try {
      const startTime = Date.now();
      
      let agent: any;
      if (proxy.type === 'socks4' || proxy.type === 'socks5') {
        agent = new SocksProxyAgent(`${proxy.type}://${proxy.host}:${proxy.port}`);
      } else {
        agent = new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`);
      }

      const response = await axios.get(testUrl, {
        httpAgent: agent,
        httpsAgent: agent,
        timeout,
      });

      const endTime = Date.now();
      proxy.speed = endTime - startTime;
      proxy.lastChecked = new Date();
      proxy.isWorking = true;

      return response.status === 200;
    } catch (error) {
      proxy.isWorking = false;
      return false;
    }
  }

  async getWorkingProxy(): Promise<Proxy | null> {
    if (!this.isLoaded) {
      await this.loadProxies();
    }

    if (this.workingProxies.length === 0) {
      return null;
    }

    const proxy = this.workingProxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.workingProxies.length;

    return proxy;
  }

  getStats() {
    return {
      total: this.proxies.length,
      working: this.workingProxies.length,
      successRate: this.proxies.length > 0 
        ? (this.workingProxies.length / this.proxies.length * 100).toFixed(2) + '%'
        : '0%',
      avgSpeed: this.workingProxies.length > 0
        ? (this.workingProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / this.workingProxies.length).toFixed(0) + 'ms'
        : '0ms',
    };
  }
}
