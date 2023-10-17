import { Request_idInterface } from './request_id.interface';

export interface GetResponseInterface extends Request_idInterface {
  values: Array<string>;
}
