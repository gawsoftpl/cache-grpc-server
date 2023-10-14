import { SetRequestInterface } from './set.request.interface';

export interface StorageStrategyInterface {
  existsMulti(keys: Array<string>): Promise<Array<boolean>>;

  getMulti(keys: Array<string>): Promise<Array<string>>;

  save(data: SetRequestInterface): Promise<string>;
}
