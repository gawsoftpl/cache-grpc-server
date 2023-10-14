import { GrpcClientOptions } from './grpc/grpc-client.options';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const grpcClientOptions = app.get(GrpcClientOptions);
  app.connectMicroservice<MicroserviceOptions>(grpcClientOptions.getOptions());
  await app.startAllMicroservices();
  await app.init();
  return app;
}

bootstrap();
