import { Request_idInterface } from './request_id.interface';

export interface ExistsResponseInterface extends Request_idInterface {
  exists: Array<boolean>;
}
