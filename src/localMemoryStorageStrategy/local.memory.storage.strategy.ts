import { Injectable } from '@nestjs/common';
import { SetRequestInterface } from '../interfaces/set.request.interface';
import { StorageStrategyInterface } from '../interfaces/storage.strategy.interface';
import { RpcException } from '@nestjs/microservices';

type StorageType = {
  value: string;
  ttl: number;
};

@Injectable()
// to do
export class LocalMemoryStorageStrategy implements StorageStrategyInterface {
  private state: Map<string, StorageType>;
  private orderedKeyList: Array<string>;

  constructor() {
    this.state = new Map();
    this.orderedKeyList = [];
    setInterval(this.cleanUp.bind(this), 1000);
  }

  async existsMulti(keys: Array<string>): Promise<Array<boolean>> {
    return keys.map((key) => this.state.has(key));
  }

  async getMulti(keys: Array<string>): Promise<Array<string>> {
    return keys.map((key) => {
      const value = this.state.get(key);
      if (!value) return '';
      return value.value;
    });
  }

  async save(data: SetRequestInterface) {
    if (typeof data?.ttl === 'undefined')
      throw new RpcException({ message: 'No set TTL' });
    if (typeof data?.key === 'undefined')
      throw new RpcException({ message: 'No set Key' });

    let ttl;
    if (data.ttl > 0 || data.ttl == -1) ttl = data.ttl;

    this.state.set(data.key, {
      value: data.value,
      ttl: new Date().getTime() / 1000 + ttl,
    });
    this.orderedKeyList.push(data.key);

    return data.value;
  }

  protected cleanUp() {
    // to do
    // const now = new Date().getTime();
    // do {
    //   const key = this.orderedKeyList.shift();
    //   if (!key || now - this.orderedKeyList[key].ttl > 0) break;
    //   this.state.delete(key);
    // } while (this.orderedKeyList.length > 0);
  }
}
