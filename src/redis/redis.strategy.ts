import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { SetRequestInterface } from '../interfaces/set.request.interface';
import { StorageStrategyInterface } from '../interfaces/storage.strategy.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RedisStrategy implements StorageStrategyInterface {
  constructor(@Inject('RedisClient') private cacheManager: RedisClientType) {}

  async existsMulti(keys: Array<string>): Promise<Array<boolean>> {
    const multi = this.cacheManager.multi();
    if (!keys) return [];
    keys.forEach((key) => multi.exists(key));
    const response = await multi.exec();
    return response.map((response) => (response ? true : false));
  }

  async getMulti(keys: Array<string>): Promise<Array<string>> {
    const multi = this.cacheManager.multi();
    if (!keys) return [];
    keys.forEach((key) => multi.get(key));
    const response = await multi.exec();
    return response.map((value) => value?.toString() ?? '');
  }

  save(data: SetRequestInterface) {
    if (typeof data?.ttl === 'undefined')
      throw new RpcException({ message: 'No set TTL' });
    if (typeof data?.key === 'undefined')
      throw new RpcException({ message: 'No set Key' });

    let opts = {};
    if (data.ttl > 0 || data.ttl == -1) opts = { EX: data.ttl };

    //if (!Number.isInteger(data?.ttl)) throw new Error('TTL wrong format');
    return this.cacheManager.set(data.key, data.value, opts);
  }
}
