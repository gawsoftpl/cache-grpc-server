# Overall
Cache server use GRPC stream and Redis as storage.
Features
- Reflection
- HealthProbe
- Redis as storage
- GRPC connection
- GET and SET method as stream

For fast data cache using grpc stream. Client has always connected with cache.
Server has implemented grpc.health.v1 for readinessprobe

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