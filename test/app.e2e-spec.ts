import { GrpcReflection } from 'grpc-js-reflection-client';
import { credentials } from '@grpc/grpc-js';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { grpcClientOptions } from '../src/grpc-client.options';
import { AppModule } from '../src/app.module';
import Config from '../src/config/config';

describe('Proxy cache server GRPC (e2e)', () => {
  let app: INestApplication;
  let client;
  let clientHealth;

  const grpcClient = async (packageName: string) => {
    const reflectionClient = new GrpcReflection(
      Config.grpc.listen,
      credentials.createInsecure(),
    );

    const descriptor =
      await reflectionClient.getDescriptorBySymbol(packageName);

    return descriptor.getPackageObject({
      keepCase: true,
      enums: String,
      longs: String,
    });
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);
    // Start gRPC microservice
    await app.startAllMicroservices();
    await app.init();
  });

  beforeEach(async () => {
    const packageCacheServer: any = await grpcClient('cacheserver.Cache');
    client = new packageCacheServer.cacheserver.Cache(
      Config.grpc.listen,
      credentials.createInsecure(),
    );

    const packageCacheServerHealth: any = await grpcClient(
      'grpc.health.v1.Health',
    );
    clientHealth = new packageCacheServerHealth.grpc.health.v1.Health(
      Config.grpc.listen,
      credentials.createInsecure(),
    );
  });

  afterEach(() => {
    client.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Set two elements via stream', (done) => {
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
  }, 5000);

  it('Should exists elements from previous SET', (done) => {
    const call = client.Exists();

    call.on('data', async (message) => {
      expect(message.exists.filter((flag) => flag).length).toBe(2);
      call.end();
    });

    call.on('end', () => {
      done();
    });

    call.write({
      keys: ['a', 'b'],
    });
  });

  it('Should get elements from previous SET', (done) => {
    const call = client.Get();
    call.on('data', async (message) => {
      expect(
        message.values.filter((value) => ['test', 'test2'].includes(value))
          .length,
      ).toBe(2);
      await call.end();
    });

    call.on('end', () => {
      done();
    });

    call.write({
      keys: ['a', 'b'],
    });
  });

  it('Should return health flag', (done) => {
    clientHealth.Check({ service: 'health' }, (e, response) => {
      expect(response.status).toBe('SERVING');
      done();
    });
  });
});
