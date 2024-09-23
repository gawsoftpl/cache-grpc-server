import { AppController } from './app.controller';
import { GrpcClientOptions } from './grpc/grpc-client.options';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { RedisModule } from './redisStrategy/redis.module';
import { HealthModule } from './health/health.module';
import { GrpcModule } from './grpc/grpc.module';
import { ConfigModule } from '@nestjs/config';
import Config from './config/config';
import { DynamicModule, Module } from '@nestjs/common';
import { RedisStrategy } from './redisStrategy';
import { CacheModule } from "@nestjs/cache-manager";

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
      ],
      imports: [
        ConfigModule.forRoot({
          load: [() => Config],
        }),
        GrpcModule,
        GrpcReflectionModule.registerAsync({
          inject: [GrpcClientOptions],
          imports: [GrpcModule],
          useFactory: (grpcClientOptions: GrpcClientOptions) => {
            return grpcClientOptions.getOptions();
          },
        }),
        CacheModule.register(),
        RedisModule,
        HealthModule,
      ],
      exports: [ConfigModule],
      controllers: [AppController],
    };
  }
}
