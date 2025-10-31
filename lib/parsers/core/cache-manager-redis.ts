// lib/parsers/core/cache-manager-redis.ts
import { Redis } from '@upstash/redis';

export class RedisCacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data as T | null;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
  }
}
