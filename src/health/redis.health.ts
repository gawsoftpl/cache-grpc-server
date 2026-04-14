import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisHealthIndicator {

  constructor(@InjectRedis() private readonly cache: Redis) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const service = new HealthIndicatorService();
    const indicator = service.check(key);

    return new Promise(async (resolve, reject) => {
      const timeoutQuit = setTimeout(async () => {
        reject(
          indicator.down()
        );
      }, 1000);

      const pingResponse = await this.cache.ping();
      clearTimeout(timeoutQuit);
      const isHealthy = pingResponse == 'PONG';

      if (isHealthy) {
        return resolve(indicator.up());
      }

      reject(indicator.down({
        pingResponse: pingResponse
      }));
    });
  }
}
