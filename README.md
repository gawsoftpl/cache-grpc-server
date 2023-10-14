# Overall
Server for fast save and read data from cache. Use GRPC stream for connection and Redis as storage.
Ready for TLS and mTLS.

Features:
- GRPC connection
- GET and SET method as stream
- Reflection
- HealthProbe
- Redis as storage
- NestJs framework

Client create one connection via stream, and send get or set command via grpc stream. This is very quick solution
Server has implemented grpc.health.v1 for readinessprobe too

## Run server
### Via docker
```sh
docker run -it --rm -e REDIS_HOST=redis://redis:6379 -p 3000:3000 gawsoft/cache-grpc-server
# Or via docker-compose 
docker-compose up
```

## For check health
If you want to run this in kubernetes run 
```sh
grpc_health_probe --addr localhost:3000
```

### Via nodejs/typescript
```sh
yarn build
yarn start
```

# Env
```sh
HOST=0.0.0.0:3000
REDIS_HOST=127.0.0.1:6379

# Setup TLS
#TLS_INSECURE=false
#TLS_KEY_PATH=/etc/ssl/key.pem
#TLS_CERT_PATH=/etc/ssl/cert.pem

# For mutual tls
#TLS_CA_CERT_PATH=/etc/ssl/ca.cert
#TLS_VERIFY_CLIENT_CERT=true

```
## ProtoBuf
```protobuf
rpc Get (stream GetRequest) returns (stream GetResponse);
rpc Exists (stream GetRequest) returns (stream ExistsResponse);
rpc Set (stream SetRequest) returns (stream SetResponse);
```


## Use as library
If you dont want to use Redis as a storage you can write custom storage class with Interface StorageStrategyInterface

```sh
npm install cache-grpc-server
```

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule, GrpcClientOptions, SetRequestInterface, StorageStrategyInterface } from 'cache-grpc-server'
import { MicroserviceOptions } from '@nestjs/microservices';

class CustomStorageStrategy implements StorageStrategyInterface
{
  async existsMulti(keys: string[]): Promise<boolean[]> {
    return [true, false];
  }
  async getMulti(keys: string[]): Promise<string[]> {
    return ['a','b'];
  }
  async save(data: SetRequestInterface): Promise<string> {
    return "test"
  }
}

export async function bootstrap() {
  // Here inject custom storage strategy
  const app = await NestFactory.create(AppModule.register(CustomStorageStrategy));
  const grpcClientOptions = app.get(GrpcClientOptions);
  app.connectMicroservice<MicroserviceOptions>(grpcClientOptions.getOptions());

  await app.startAllMicroservices();
  await app.init();
  return app;
}

bootstrap();

```

## Tests
E2E tests
```sh
yarn test:e2e
```
## Example client

```sh
ts-node examples/client-set.ts
ts-node examples/client-get.ts
```