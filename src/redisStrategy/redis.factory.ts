import { Logger } from '@nestjs/common';
import { createClient, createCluster } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const RedisFactory = async (configService: ConfigService) => {
  const logger = new Logger('RedisFactory');

  const prepareUrl = (configData) => {
    return configData.url.split(',');
  };

  const connect = async () => {
    const urls = prepareUrl(configService.get('redis.connection'));

    let client;
    try {

      if (urls.length == 1)
        client = createClient({
          url: urls[0],
          database: configService.get('redis.connection.database'),
        });
      else
        client = createCluster({
          rootNodes: urls.map((url) => ({
            url: url
          })),
        })

      client.on('error', (err) => {
        logger.error(err);
      });

      await client.connect();
    } catch (err) {
      logger.error(err);
      setTimeout(
        async () => {
          logger.error('Redis reconnect');
          await client.connect();
        },
        configService.get('redis.timeout.connection') || 5000,
      );
    }

    return client;
  };

  return await connect();
};

// Leaky Bucket use two connection with Redis
// First connect for normal cache set/get/hget etc.
// Second is used for subscribe. Publish method will run for redisFactoryNormal

export const redisFactory = {
  imports: [ConfigModule],
  inject: [ConfigService],
  provide: 'RedisClient',
  useFactory: RedisFactory,
};
