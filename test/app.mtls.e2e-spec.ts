import { join } from 'path';

process.env.TLS_INSECURE = 'false';
process.env.TLS_KEY_PATH = join(__dirname, './tls/server/key.pem');
process.env.TLS_CERT_PATH = join(__dirname, './tls/server/cert.pem');
process.env.TLS_CA_CERT_PATH = join(__dirname, './tls/ca/ca.cert.pem');
process.env.TLS_VERIFY_CLIENT_CERT = 'true';

import { ChannelCredentials } from '@grpc/grpc-js';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { GrpcClientOptions } from '../src/grpc/grpc-client.options';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import { grpcClient } from './grpcClient';
import { GrpcReflection } from 'grpc-js-reflection-client';

describe('Proxy cache server GRPC with TLS and mTLS (e2e)', () => {
  let app: INestApplication;
  let client;
  const host = 'localhost:3000';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.register()],
    }).compile();

    //app = module.createNestApplication();

    app = module.createNestApplication();
    const grpcClientOptions = app.get(GrpcClientOptions);
    app.connectMicroservice<MicroserviceOptions>(
      grpcClientOptions.getOptions(),
    );
    await app.startAllMicroservices();
    await app.init();
  });

  afterEach(() => {
    client.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should pass request with mTLS', (done) => {
    const credentialsClient = ChannelCredentials.createSsl(
      fs.readFileSync(join(__dirname, 'tls/ca/ca.cert.pem')),
      fs.readFileSync(join(__dirname, 'tls/client/key.pem')),
      fs.readFileSync(join(__dirname, 'tls/client/cert.pem')),
    );

    grpcClient(host, 'cacheserver.Cache', credentialsClient).then(
      (packageCacheServer: any) => {
        client = new packageCacheServer.cacheserver.Cache(
          host,
          credentialsClient,
        );

        const call = client.Set();
        let saved_success = 0;

        call.on('data', async (message) => {
          expect(message.saved).toBe(true);
          saved_success++;
          if (saved_success == 2) await call.end();
        });

        call.on('end', () => {
          done();
        });

        call.write({
          key: 'a',
          value: 'test',
          ttl: 50,
        });

        call.write({
          key: 'b',
          value: 'test2',
          ttl: 50,
        });
      },
    );
  }, 15000);

  it('Should block request with mTLS without cert and key', async () => {
    const credentialsClient = ChannelCredentials.createSsl(
      fs.readFileSync(join(__dirname, 'tls/ca/ca.cert.pem')),
      fs.readFileSync(join(__dirname, 'tls/wrong/key.pem')),
      fs.readFileSync(join(__dirname, 'tls/wrong/cert.pem')),
    );

    const reflectionClient = new GrpcReflection(host, credentialsClient);
    await expect(
      reflectionClient.getDescriptorBySymbol('cacheserver.Cache'),
    ).rejects.toThrow(Error);

  }, 15000);
});
