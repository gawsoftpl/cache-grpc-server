import { Controller, Logger } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
  private logs: Logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private redis: RedisHealthIndicator,
  ) {}

  @GrpcMethod('Health', 'Check')
  async check() {
    let status = 'NOT_SERVING';
    try {
      await this.redis.isHealthy('redis');
      status = 'SERVING';
    } catch (err) {
      this.logs.error(err);
    }

    return {
      status: status,
    };
  }
}
