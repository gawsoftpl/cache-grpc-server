import { Request_idInterface } from "./request_id.interface";

export interface GetRequestInterface extends Request_idInterface {
  keys: Array<string>;
}