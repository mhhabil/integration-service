import { Injectable } from '@nestjs/common';
import { Information } from '../interfaces/information';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';

@Injectable()
export class InformationService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async create(information: Information, userId: string) {
    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(
      `Informasi:{${information.hospital_id}}`,
      '.',
    );
    if (result && result !== null) {
      const params = {
        ...information,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(`Informasi:{${params.hospital_id}}`, '$', params);
    } else {
      const params = {
        ...information,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(`Informasi:{${params.hospital_id}}`, '$', params);
    }
  }

  async findById(id: string): Promise<Information> {
    const result = await this.redisService.get(`Informasi:{${id}}`, '.');
    return result;
  }
}
