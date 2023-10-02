import { Injectable } from '@nestjs/common';
import {
  RedisService,
  DEFAULT_REDIS_NAMESPACE,
} from '@liaoliaots/nestjs-redis';
import { ReJson } from '../rejson';

@Injectable()
export class RedisSharedService {
  protected rejson: ReJson;

  constructor(private redisService: RedisService) {
    const cl = this.redisService.getClient(DEFAULT_REDIS_NAMESPACE);
    this.rejson = new ReJson(cl);
  }

  async set(key: string, path: string, value: any) {
    try {
      this.rejson.set(key, path, value);
    } catch (err) {
      console.error(err);
      throw new Error('Post Data Redis Failed');
    }
  }

  async get(key: string, path: string) {
    return await this.rejson.get(key, path);
  }
}
