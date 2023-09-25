import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisSharedService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  async set(key: string, value: string | number | Buffer) {
    this.redis.set(key, value).then((result) => {
      if (result === 'OK') {
        return true;
      } else {
        throw new Error(result);
      }
    });
  }

  async get(key: string) {
    this.redis
      .get(key)
      .then((value) => {
        return value;
      })
      .catch((error) => {
        console.error(error);
        throw new Error('Get Data Redis Failed');
      });
  }
}
