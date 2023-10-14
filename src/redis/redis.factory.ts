import { Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const RedisFactory = async (configService: ConfigService) => {
  const logger = new Logger('RedisFactory');

  const prepareConfig = (config) => {
    if (config.url) {
      return config.url;
    }

    let url = 'redis://';
    if (config.username && config.password) {
      url += `${config.username}:${config.password}@`;
    }

    if (isNaN(parseInt(config.port)))
      throw new Error('Redis port should be a number');

    url += `${config.host}:${config.port}`;
    return url;
  };

  const connect = async () => {
    const url = prepareConfig(configService.get('redis.connection'));

    let client;
    try {
      client = createClient({
        url: url,
        database: configService.get('redis.connection.database'),
      });

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
