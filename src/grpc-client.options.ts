import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
import Config from './config/config';
import { ServerCredentials } from '@grpc/grpc-js';

const getCredential = () => {
  if (Config.grpc.credentials.insecure)
    return ServerCredentials.createInsecure();

  if (!Config.grpc.credentials.privateKey)
    throw new Error('No set TLS certificate in Config');

  if (!Config.grpc.credentials.certChain)
    throw new Error('No set TLS certificate in Config');

  if (Config.grpc.credentials.verifyClient && !Config.grpc.credentials.ca_cert)
    throw new Error(
      'If you want to set mTLS, please setup CA CERT use env TLS_CA_CERT_PATH',
    );

  return ServerCredentials.createSsl(
    Config.grpc.credentials.ca_cert ?? null,
    [
      {
        private_key: Config.grpc.credentials.privateKey,
        cert_chain: Config.grpc.credentials.certChain,
      },
    ],
    Config.grpc.credentials.verifyClient,
  );
};

export const grpcClientOptions: GrpcOptions = addReflectionToGrpcConfig({
  transport: Transport.GRPC,
  options: {
    url: Config.grpc.listen,
    credentials: getCredential(),
    package: ['cacheserver', 'grpc.health.v1'],
    protoPath: [
      join(__dirname, '../protos/cache-server.proto'),
      join(__dirname, '../protos/health.proto'),
    ],
  },
});
