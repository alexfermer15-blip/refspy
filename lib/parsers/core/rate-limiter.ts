export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Удаляем старые запросы вне окна
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // Если достигли лимита - ждем
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      return this.waitForSlot();
    }

    // Добавляем текущий запрос
    this.requests.push(now);
  }

  reset(): void {
    this.requests = [];
  }
}
