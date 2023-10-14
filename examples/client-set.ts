import { GrpcReflection } from 'grpc-js-reflection-client';
import { credentials } from '@grpc/grpc-js';

(async () => {
  try {
    const host = '127.0.0.1:3000';

    // Get proto by reflection
    const reflectionClient = new GrpcReflection(
      host,
      credentials.createInsecure(),
    );

    const descriptor =
      await reflectionClient.getDescriptorBySymbol('cacheserver.Cache');

    const packageObject: any = descriptor.getPackageObject({
      keepCase: true,
      enums: String,
      longs: String,
    });

    const client = new packageObject.cacheserver.Cache(
      host,
      credentials.createInsecure(),
    );

    const call = client.Set();

    call.on('data', async (message) => {
      console.log(message);
      call.end()
    });

    call.on('end', () => {
      console.log('END');
    });

    call.write({
      key: 'a',
      value: 'test',
      ttl: 500,
    });

    call.write({
      key: 'b',
      value: 'test2',
      ttl: 500,
    });
  }catch(err){
    console.log("ERROR", err.message);
  }
})();
