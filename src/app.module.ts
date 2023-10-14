import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GrpcClientOptions } from './grpc/grpc-client.options';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { GrpcModule } from './grpc/grpc.module';
import { ConfigModule } from '@nestjs/config';
import Config from './config/config';

@Module({
  providers: [GrpcClientOptions, AppService],
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
    RedisModule,
    HealthModule,
  ],
  exports: [ConfigModule],
  controllers: [AppController],
})
export class AppModule {}
