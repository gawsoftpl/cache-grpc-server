import { credentials } from '@grpc/grpc-js';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GrpcClientOptions } from '../src/grpc/grpc-client.options';
import { AppModule } from '../src/app.module';
import Config from '../src/config/config';
import { grpcClient } from './grpcClient';

describe('Proxy cache server GRPC (e2e)', () => {
  let app: INestApplication;
  let client;
  let clientHealth;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.register()],
    }).compile();

    app = module.createNestApplication();
    const grpcClientOptions = app.get(GrpcClientOptions);
    app.connectMicroservice<MicroserviceOptions>(
      grpcClientOptions.getOptions(),
    );
    await app.startAllMicroservices();
    await app.init();
  });

  beforeEach(async () => {
    const credentialsClient = credentials.createInsecure();

    const packageCacheServer: any = await grpcClient(
      'localhost:3000',
      'cacheserver.Cache',
      credentialsClient,
    );
    client = new packageCacheServer.cacheserver.Cache(
      Config.grpc.listen,
      credentialsClient,
    );

    const packageCacheServerHealth: any = await grpcClient(
      'localhost:3000',
      'grpc.health.v1.Health',
      credentialsClient,
    );
    clientHealth = new packageCacheServerHealth.grpc.health.v1.Health(
      Config.grpc.listen,
      credentialsClient,
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

  it('Should return error on set wrong ttl format', (done) => {
    const call = client.Set();

    call.on('error', (err) => {
      expect(err.message).toContain('No set TTL');
      done();
    });

    call.write({
      value: 'test',
    });
  }, 5000);

  it('Should exists elements from previous SET', (done) => {
    const call = client.Exists();

    call.on('data', async (message) => {
      expect(message.id).toBe('abc');

      // Exists keys
      expect(message.exists).toStrictEqual([true, true, false]);

      call.end();
    });

    call.on('end', () => {
      done();
    });

    call.write({
      id: 'abc',
      keys: ['a', 'b', 'noExists'],
    });
  });

  it('Should get elements from previous SET', (done) => {
    const call = client.Get();
    call.on('data', async (message) => {
      expect(message.id).toBe('abc2');

      expect(message.values).toStrictEqual(['test', 'test2', '']);

      await call.end();
    });

    call.on('end', () => {
      done();
    });

    call.write({
      id: 'abc2',
      keys: ['a', 'b', 'no-exists'],
    });
  });

  it('Should return health flag', (done) => {
    clientHealth.Check({ service: 'health' }, (e, response) => {
      expect(response.status).toBe('SERVING');
      done();
    });
  });

  it('Run 10000 get requests via one stream', (done) => {
    const call = client.Get();
    const calls_to_run = 10000;
    let calls_counter = 0;
    call.on('data', async (message) => {
      expect(message.values).toEqual(['test', 'test2', '']);
      calls_counter++;
      if (calls_counter == calls_to_run) await call.end();
    });

    call.on('end', () => {
      done();
    });

    for (let i = 0; i < calls_to_run; i++) {
      call.write({
        keys: ['a', 'b', randomUUID()],
      });
    }
  }, 20000);
});
