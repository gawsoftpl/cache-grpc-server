import { Inject, Injectable } from '@nestjs/common';
import { SetRequestInterface } from './interfaces/set.request.interface';
import { StorageStrategyInterface } from './interfaces/storage.strategy.interface';

@Injectable()
export class AppService {
  constructor(
    @Inject('STORAGE_STRATEGY')
    private readonly storageStrategy: StorageStrategyInterface,
  ) {}

  async existsMulti(keys: Array<string>) {
    return await this.storageStrategy.existsMulti(keys);
  }

  async getMulti(keys: Array<string>) {
    return await this.storageStrategy.getMulti(keys);
  }

  async save(request: SetRequestInterface) {
    await this.storageStrategy.save(request);
  }
}
