import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { GetRequestInterface } from './interfaces/get.request.interface';
import { GetResponseInterface } from './interfaces/get.response.interface';
import { SetRequestInterface } from './interfaces/set.request.interface';
import { Observable, Subject } from 'rxjs';
import { SetResponseInterface } from './interfaces/set.response.interface';
import { ExistsResponseInterface } from './interfaces/exists.response.interface';

interface Service {
  findOne(data: GetRequestInterface): Observable<GetResponseInterface>;
  findMany(
    upstream: Observable<SetRequestInterface>,
  ): Observable<SetResponseInterface>;
}

@Controller('sample')
export class HelloController {
  private Service: Service;
  constructor(private readonly appService: AppService) {}

  @GrpcStreamMethod('Cache', 'Exists')
  exists(
    data: Observable<GetRequestInterface>,
  ): Observable<ExistsResponseInterface> {
    const subject = new Subject<ExistsResponseInterface>();

    const onNext = async (request: GetRequestInterface) => {
      const item: ExistsResponseInterface = {
        exists: await this.appService.existsMulti(request.keys),
      };
      subject.next(item);
    };
    const onComplete = () => subject.complete();
    data.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return subject.asObservable();
  }

  @GrpcStreamMethod('Cache', 'Get')
  get(data: Observable<GetRequestInterface>): Observable<GetResponseInterface> {
    const subject = new Subject<GetResponseInterface>();
    const onNext = async (request: GetRequestInterface) => {
      const item: GetResponseInterface = {
        values: await this.appService.getMulti(request.keys),
      };
      subject.next(item);
    };

    const onComplete = () => subject.complete();
    data.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return subject.asObservable();
  }

  @GrpcStreamMethod('Cache', 'Set')
  set(data: Observable<SetRequestInterface>): Observable<SetResponseInterface> {
    const subject = new Subject<SetResponseInterface>();

    const onNext = (request: SetRequestInterface) => {
      this.appService.save(request);
      const item: SetResponseInterface = {
        saved: true,
      };
      subject.next(item);
    };
    const onComplete = () => subject.complete();
    data.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return subject.asObservable();
  }
}
