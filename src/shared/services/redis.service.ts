import { Inject, Injectable } from '@nestjs/common';
import {
  RedisService,
  DEFAULT_REDIS_NAMESPACE,
} from '@liaoliaots/nestjs-redis';
import { ReJson } from '../rejson';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisSharedService {
  protected rejson: ReJson;

  constructor(
    private redisService: RedisService,
    @Inject('REDIS_CLIENT') private redis: RedisClientType,
  ) {
    const cl = this.redisService.getClient(DEFAULT_REDIS_NAMESPACE);
    this.rejson = new ReJson(cl);
  }

  async keys(id: string, path: string) {
    try {
      const result = await this.redis.json.objKeys(id, path);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async keyList(prefix: string) {
    try {
      const result = await this.redis.keys(prefix);
      return result;
    } catch (err) {
      throw err;
    }
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

  async getCompany(companyCode: string) {
    try {
      const companies = await this.rejson.get('Companies', '.companies');
      return companies.find((item) => item.code === companyCode);
    } catch (err) {
      throw new Error('Get companies failed');
    }
  }

  async append(key: string, path: any, value: any) {
    try {
      const checkObj = await this.keys(key, '.');
      let result = null;
      if (checkObj !== null && checkObj.includes(path)) {
        result = await this.redis.json.arrAppend(key, path, value);
      } else {
        result = await this.rejson.set(key, path, []);
        result = await this.redis.json.arrAppend(key, path, value);
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getIntegrationType(typeId: string) {
    try {
      const companies = await this.rejson.get(
        'IntegrationType',
        '.integration_type',
      );
      return companies.find((item) => item.code === typeId);
    } catch (err) {
      throw new Error('Get integration type failed');
    }
  }
}
