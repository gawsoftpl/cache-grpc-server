import { Injectable } from '@nestjs/common';
import { SetRequestInterface } from '../interfaces/set.request.interface';
import { StorageStrategyInterface } from '../interfaces/storage.strategy.interface';
import { RpcException } from '@nestjs/microservices';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisStrategy implements StorageStrategyInterface {
  private cacheManager: Redis;

  constructor(private redisService: RedisService) {
    this.cacheManager = redisService.getOrThrow();
  }

  async existsMulti(keys: Array<string>): Promise<Array<boolean>> {
    const multi = this.cacheManager.multi();
    if (!keys) return [];
    keys.forEach((key) => multi.exists(key));
    const response = await multi.exec();
    return response.map(([err, response]) => (!err && response ? true : false));
  }

  async getMulti(keys: Array<string>): Promise<Array<string>> {
    const multi = this.cacheManager.multi();
    if (!keys) return [];
    keys.forEach((key) => multi.get(key));
    const response = await multi.exec();
    return response.map(([err, value]) => {
      if (err) return '';
      return value ? value.toString() : '';
    });
  }

  save(data: SetRequestInterface) {
    if (typeof data?.ttl === 'undefined')
      throw new RpcException({ message: 'No set TTL' });
    if (typeof data?.key === 'undefined')
      throw new RpcException({ message: 'No set Key' });

    const expireTtl = data?.ttl ?? -1;

    if (!Number.isInteger(data?.ttl)) throw new Error('TTL wrong format');
    return this.cacheManager.set(data.key, data.value, 'EX', expireTtl);
  }
}
