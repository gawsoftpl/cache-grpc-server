import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '../redis/redis.module';
import { RedisHealthIndicator } from './redis.health';
import { ConfigModule } from '@nestjs/config';
import Config from '../config/config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => Config],
      isGlobal: true,
    }),
    TerminusModule,
    RedisModule,
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
