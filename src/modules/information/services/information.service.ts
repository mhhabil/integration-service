import { Injectable } from '@nestjs/common';
import { Information } from '../interfaces/information';
import { RedisSharedService } from 'src/shared/services/redis.service';

@Injectable()
export class InformationService {
  constructor(private redisService: RedisSharedService) {}
  create(information: Information) {
    this.redisService.set(
      `Informasi:{${information.hospital_id}}`,
      '$',
      information,
    );
  }

  async findAll(id: string): Promise<Information> {
    const test: any = await this.redisService.get(`Informasi:{${id}}`, '$');
    return test;
  }
}
