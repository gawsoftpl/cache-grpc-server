import { AppController } from './app.controller';
import { GrpcClientOptions } from './grpc/grpc-client.options';
import { RedisModule } from './redisStrategy/redis.module';
import { HealthModule } from './health/health.module';
import { GrpcModule } from './grpc/grpc.module';
import { ConfigModule } from '@nestjs/config';
import Config from './config/config';
import { DynamicModule, Module } from '@nestjs/common';
import { RedisStrategy } from './redisStrategy';
import { AppService } from "./app.service";

@Module({})
export class AppModule {
  static register(storageStrategy: any = undefined): DynamicModule {
    if (!storageStrategy) storageStrategy = RedisStrategy;

    return {
      module: AppModule,
      providers: [
        GrpcClientOptions,
        {
          provide: 'STORAGE_STRATEGY',
          useClass: storageStrategy,
        },
        AppService,
      ],
      imports: [
        ConfigModule.forRoot({
          load: [() => Config],
        }),
        GrpcModule,
        RedisModule,
        HealthModule,
      ],
      exports: [ConfigModule],
      controllers: [AppController],
    };
  }
}
