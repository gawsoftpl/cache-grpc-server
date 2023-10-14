import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisFactory } from './redis.factory';

@Module({
  imports: [ConfigModule],
  providers: [redisFactory],
  exports: [redisFactory],
})
export class RedisModule {}
