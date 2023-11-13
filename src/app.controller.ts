import { Controller, Inject } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { GetRequestInterface } from './interfaces/get.request.interface';
import { GetResponseInterface } from './interfaces/get.response.interface';
import { SetRequestInterface } from './interfaces/set.request.interface';
import { Observable, Subject } from 'rxjs';
import { SetResponseInterface } from './interfaces/set.response.interface';
import { ExistsResponseInterface } from './interfaces/exists.response.interface';
import { StorageStrategyInterface } from './interfaces/storage.strategy.interface';
import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';

@Controller('sample')
export class AppController {
  constructor(
    @Inject('STORAGE_STRATEGY')
    private readonly storageStrategy: StorageStrategyInterface,
  ) {}

  @GrpcStreamMethod('Cache', 'Exists')
  exists(
    data: Observable<GetRequestInterface>,
  ): Observable<ExistsResponseInterface> {
    const subject = new Subject<ExistsResponseInterface>();

    const onNext = async (request: GetRequestInterface) => {
      const item: ExistsResponseInterface = {
        id: request.id,
        exists: await this.storageStrategy.existsMulti(request.keys),
      };
      subject.next(item);
    };
    const onComplete = () => subject.complete();
    data.subscribe({
      next: onNext,
      complete: onComplete,
      error: subject.error,
    });

    return subject.asObservable();
  }

  @GrpcStreamMethod('Cache', 'Get')
  get(data: Observable<GetRequestInterface>): Observable<GetResponseInterface> {
    const subject = new Subject<GetResponseInterface>();
    const onNext = async (request: GetRequestInterface) => {
      const item: GetResponseInterface = {
        id: request.id,
        values: await this.storageStrategy.getMulti(request.keys),
      };
      subject.next(item);
    };

    const onComplete = () => subject.complete();
    data.subscribe({
      next: onNext,
      complete: onComplete,
      error: subject.error,
    });

    return subject.asObservable();
  }

  @GrpcStreamMethod('Cache', 'Set')
  set(
    data: Observable<SetRequestInterface>,
    metadata: Metadata,
    call: ServerDuplexStream<any, any>,
  ): Observable<SetResponseInterface> {
    const subject = new Subject<SetResponseInterface>();

    const onNext = async (request: SetRequestInterface) => {
      try {
        await this.storageStrategy.save(request);
      } catch (err) {
        call.emit('error', err);
        return;
      }
      const item: SetResponseInterface = {
        key: request.key,
        saved: true,
      };
      subject.next(item);
    };

    data.subscribe({
      next: onNext,
      complete: () => subject.complete(),
      error: (e) => subject.error(e),
    });

    return subject.asObservable();
  }
}
