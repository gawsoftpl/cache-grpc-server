import { GrpcReflection } from 'grpc-js-reflection-client';
import { ChannelCredentials } from '@grpc/grpc-js';
import { readFileSync } from 'fs';
import { join } from 'path';

function getChannelCredentials() {
  return ChannelCredentials.createSsl(
    readFileSync(
      join(__dirname,'../test/tls/ca/ca.cert.pem'),
    ),
  );
}

try {
  (async () => {
    const client = new GrpcReflection(
      'localhost:3000',
      getChannelCredentials(),
    );
    console.log(await client.listServices());
  })();
} catch (e) {
  console.log(e);
}
