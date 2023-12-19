import { Module } from '@nestjs/common';
import { RedisClientOptions, createClient } from 'redis';
import { ConfigService } from './services/config.service';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: 'REDIS_OPTIONS',
      useFactory: async (configService: ConfigService) => {
        return {
          url: `redis://${configService.redis.user}:${configService.redis.password}@${configService.redis.host}:${configService.redis.port}`,
        };
      },
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: RedisClientOptions) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
