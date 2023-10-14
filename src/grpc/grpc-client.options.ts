import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import { ServerCredentials } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GrpcClientOptions {
  constructor(private configService: ConfigService) {}

  getOptions() {
    return addReflectionToGrpcConfig({
      transport: Transport.GRPC,
      options: {
        url: this.configService.get('grpc.listen'),
        credentials: this.getCredentials(),
        package: ['cacheserver', 'grpc.health.v1'],
        protoPath: [
          join(__dirname, '../../protos/cache-server.proto'),
          join(__dirname, '../../protos/health.proto'),
        ],
      },
    });
  }

  getCredentials() {
    if (this.configService.get('grpc.credentials.insecure'))
      return ServerCredentials.createInsecure();

    if (!this.configService.get('grpc.credentials.privateKey'))
      throw new Error('No set TLS certificate in Config');

    if (!this.configService.get('grpc.credentials.certChain'))
      throw new Error('No set TLS certificate in Config');

    if (
      this.configService.get('grpc.credentials.verifyClient') &&
      !this.configService.get('grpc.credentials.caCert')
    )
      throw new Error(
        'If you want to set mTLS, please setup CA CERT use env TLS_CA_CERT_PATH',
      );

    return ServerCredentials.createSsl(
      this.configService.get('grpc.credentials.caCert') ?? null,
      [
        {
          private_key: this.configService.get('grpc.credentials.privateKey'),
          cert_chain: this.configService.get('grpc.credentials.certChain'),
        },
      ],
      this.configService.get('grpc.credentials.verifyClient'),
    );
  }
}
