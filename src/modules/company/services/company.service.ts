import { Injectable } from '@nestjs/common';
import { Companies } from '../interfaces/company';
import { CompanyCreateDto } from '../dtos/company-create.dto';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';

@Injectable()
export class CompanyService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async create(companies: CompanyCreateDto[], userId: string) {
    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(`Companies`, '.');
    if (result && result !== null) {
      const params = {
        companies,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(`Companies`, '$', params);
    } else {
      const params = {
        companies,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(`Companies`, '$', params);
    }
  }

  async findAll(): Promise<Companies> {
    const result = await this.redisService.get(`Companies`, '.');
    return result;
  }
}
