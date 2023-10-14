import { IsArray } from 'class-validator';
import { GetRequestInterface } from '../interfaces/get.request.interface';

export class GetRequestDto implements GetRequestInterface {
  @IsArray()
  keys: Array<string>;
}
