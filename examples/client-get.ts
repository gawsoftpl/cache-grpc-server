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

    const call = client.Get();

    call.on('data', async (message) => {
      console.log(message);
      call.end();
    });

    call.on('end', () => {
      console.log('END');
    });

    call.write({
      //keys: ['b'],
      as: "fd"
    });
  } catch (err) {
    console.log('ERROR', err.message);
  }
})();
