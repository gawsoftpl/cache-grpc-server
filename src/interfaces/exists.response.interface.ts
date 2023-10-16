import { KeysInterface } from './keys.interface';

export interface ExistsResponseInterface extends KeysInterface {
  exists: Array<boolean>;
}
