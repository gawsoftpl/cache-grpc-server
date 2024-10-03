/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, Logger, Module } from '@nestjs/common';
import {
  RedisModule as NestJsRedisModule,
  RedisClientOptions,
  ClusterModule as NestJsClusterModule,
  ClusterClientOptions,
} from '@liaoliaots/nestjs-redis';
import Config from '../config/config';

@Module({})
export class RedisModuleFactory {
  static async forAsyncRoot(
    redisConfig: typeof Config.redis
  ): Promise<DynamicModule> {
    const logger = new Logger(RedisModuleFactory.name);

    const commonOptions: Record<string, any> = {};

    const urls =
      redisConfig?.connection?.url?.length > 0
        ? redisConfig.connection.url.split(',').map((url) => new URL(url))
        : [];

    const isSentinel = redisConfig.connection?.sentinel?.hosts?.length > 0;

    if (isSentinel) {
      const sentinelHosts = redisConfig.connection.sentinel.hosts
        .split(',')
        .map((host) => new URL(host));
      commonOptions.name = redisConfig.connection.sentinel.master;
      commonOptions.sentinelUsername = sentinelHosts[0].username
        ? sentinelHosts[0].username
        : undefined;
      commonOptions.sentinelPassword = sentinelHosts[0].password
        ? sentinelHosts[0].password
        : undefined;

      // Set user and password for from urls
      if (urls.length > 0) {
        commonOptions.username = urls[0].username
          ? urls[0].username
          : undefined;
        commonOptions.password = urls[0].password
          ? urls[0].password
          : undefined;
      }

      commonOptions.sentinels = sentinelHosts.map((hostData) => {
        return {
          host: hostData.hostname,
          port: parseInt(hostData.port),
        };
      });
    }

    const isCluster = !isSentinel && urls.length > 1;

    const dynamicModuleFactory = isCluster
      ? NestJsClusterModule.forRoot
      : NestJsRedisModule.forRoot;

    const config: RedisClientOptions[] & ClusterClientOptions[] = [
      {
        connectTimeout: redisConfig.timeout.connection,
        role: 'master',
        url: urls.length == 1 ? redisConfig.connection.url : undefined,
        reconnectOnError: (err) => {
          logger.log(err);
          return 2;
        },
        nodes:
          urls?.length > 1 ? redisConfig.connection.url.split(',') : undefined,
      },
    ];

    const module = dynamicModuleFactory(
      {
        commonOptions: commonOptions,
        config: config as any,
        readyLog: true,
        errorLog: true,
      },
      true,
    );

    return {
      imports: [module],
      exports: [module],
      global: true,
      module: RedisModuleFactory,
    };
  }
}
