import { Module } from '@nestjs/common';
import { HelloController } from './app.controller';
import { grpcClientOptions } from './grpc-client.options';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import Config from './config/config';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from "./health/health.module";
@Module({
  imports: [
    GrpcReflectionModule.register(grpcClientOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => Config],
    }),
    RedisModule,
    HealthModule,
  ],
  controllers: [HelloController],
  providers: [AppService],
})
export class AppModule {}
