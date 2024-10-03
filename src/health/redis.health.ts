import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private cache: Redis;

  constructor(private redisService: RedisService) {
    super();
    this.cache = redisService.getOrThrow();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    return new Promise(async (resolve, reject) => {
      const timeoutQuit = setTimeout(async () => {
        reject(
          new HealthCheckError(
            'Redis failed',
            this.getStatus(key, false, {
              pingResponse: 'Connection timeout',
            }),
          ),
        );
      }, 1000);

      const pingResponse = await this.cache.ping();
      clearTimeout(timeoutQuit);
      const isHealthy = pingResponse == 'PONG';
      const result = this.getStatus(key, isHealthy, {
        pingResponse: pingResponse,
      });

      if (isHealthy) {
        return resolve(result);
      }

      reject(new HealthCheckError('Redis failed', result));
    });
  }
}
