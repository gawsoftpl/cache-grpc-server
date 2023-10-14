import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { SetRequestInterface } from './interfaces/set.request.interface';

@Injectable()
export class AppService {
  constructor(@Inject('RedisClient') private cacheManager: RedisClientType) {}

  async existsMulti(keys: Array<string>): Promise<Array<boolean>> {
    const multi = this.cacheManager.multi();
    keys.forEach((key) => multi.exists(key));
    const response = await multi.exec();
    return response.map((response) => (response ? true : false));
  }

  async getMulti(keys: Array<string>): Promise<Array<string>> {
    const multi = this.cacheManager.multi();
    keys.forEach((key) => multi.get(key));
    const response = await multi.exec();
    return response.map((value) => value?.toString() ?? '');
  }

  save(data: SetRequestInterface) {
    return this.cacheManager.set(data.key, data.value, { EX: data.ttl });
  }
}
