import { Module } from '@nestjs/common';
import { RedisModuleFactory } from './redis.module.factory';
import { ConfigModule } from '@nestjs/config';
import { RedisStrategy } from './redis.strategy';
import Config from '../config/config';

@Module({
  imports: [ConfigModule, RedisModuleFactory.forAsyncRoot(Config.redis)],
  providers: [RedisStrategy],
  exports: [RedisStrategy],
})
export class RedisModule {}
