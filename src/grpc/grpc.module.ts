import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GrpcClientOptions } from './grpc-client.options';

@Module({
  imports: [ConfigModule],
  exports: [GrpcClientOptions],
  providers: [GrpcClientOptions],
})
export class GrpcModule {}
