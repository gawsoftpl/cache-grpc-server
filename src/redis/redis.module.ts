import { Module } from '@nestjs/common';
import { redisFactory } from './redis.factory';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [redisFactory],
  exports: [redisFactory],
})
export class RedisModule {}
