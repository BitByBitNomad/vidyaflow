import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  // In-memory fallback map for offline development or testing without Redis
  private memorySortedSets: Map<string, Map<string, number>> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis reconnection limit reached. Falling back to in-memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 1000);
        },
        enableReadyCheck: false,
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        this.logger.log(`Connected to Redis at ${redisUrl}`);
      }).catch((err) => {
        this.isConnected = false;
        this.logger.warn(`Redis connection failed (${err.message}). Using in-memory leaderboard fallback.`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // Suppress repeated connection logs
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });
    } catch (err) {
      this.logger.warn(`Redis initialization warning: ${err.message}. Using in-memory fallback.`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (err) {
        // Ignore on shutdown
      }
    }
  }

  /**
   * Adds or updates a member's score in the sorted set.
   * Key pattern: `leaderboard:{quizId}`
   */
  async zadd(key: string, score: number, member: string): Promise<number | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.zadd(key, score, member);
      } catch (err) {
        this.logger.warn(`Redis zadd failed: ${err.message}. Falling back to in-memory.`);
      }
    }

    // In-memory fallback
    if (!this.memorySortedSets.has(key)) {
      this.memorySortedSets.set(key, new Map());
    }
    this.memorySortedSets.get(key)!.set(member, score);
    return 1;
  }

  /**
   * Fetches entries sorted by score descending with scores.
   */
  async zrevrangeWithScores(
    key: string,
    start: number = 0,
    stop: number = -1,
  ): Promise<Array<{ member: string; score: number }>> {
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
        const results: Array<{ member: string; score: number }> = [];
        for (let i = 0; i < raw.length; i += 2) {
          results.push({
            member: raw[i],
            score: parseFloat(raw[i + 1]),
          });
        }
        return results;
      } catch (err) {
        this.logger.warn(`Redis zrevrange failed: ${err.message}. Falling back to in-memory.`);
      }
    }

    // In-memory fallback
    const set = this.memorySortedSets.get(key);
    if (!set) return [];

    const sorted = Array.from(set.entries())
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => b.score - a.score);

    const end = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, end);
  }

  /**
   * Get member score
   */
  async zscore(key: string, member: string): Promise<number | null> {
    if (this.isConnected && this.client) {
      try {
        const score = await this.client.zscore(key, member);
        return score ? parseFloat(score) : null;
      } catch (err) {
        this.logger.warn(`Redis zscore failed: ${err.message}. Falling back to in-memory.`);
      }
    }

    const set = this.memorySortedSets.get(key);
    return set?.get(member) ?? null;
  }

  /**
   * Delete key (e.g. on quiz deletion or reset)
   */
  async del(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.del(key);
      } catch (err) {
        // Fallback
      }
    }
    this.memorySortedSets.delete(key);
    return 1;
  }

  /**
   * Set key-value with TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        // Fallback
      }
    }
  }

  /**
   * Get string value
   */
  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        // Fallback
      }
    }
    return null;
  }
}
