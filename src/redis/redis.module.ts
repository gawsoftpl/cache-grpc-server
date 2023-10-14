import { Module } from '@nestjs/common';
import { redisFactory } from './redis.factory';
import { ConfigModule } from '@nestjs/config';
import { RedisStrategy } from './redis.strategy';

@Module({
  imports: [ConfigModule],
  providers: [redisFactory, RedisStrategy],
  exports: [redisFactory, RedisStrategy],
})
export class RedisModule {}
