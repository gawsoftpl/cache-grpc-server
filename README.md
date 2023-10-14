# Overall
Cache server use GRPC stream and Redis as storage.
For fast data cache using grpc stream. Client has always connected with cache.

# Install
```sh
yarn install cache-server-grpc
```

```sh
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

## Example client

```sh
ts-node examples/client.ts
```