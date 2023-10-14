import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject('RedisClient') private cache) {
    super();
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
