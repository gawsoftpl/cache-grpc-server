import { SetRequestInterface } from './set.request.interface';
import { KeysType } from './keys.interface';

export interface StorageStrategyInterface {
  existsMulti(keys: KeysType): Promise<Array<boolean>>;

  getMulti(keys: KeysType): Promise<Array<string>>;

  save(data: SetRequestInterface): Promise<string>;
}
