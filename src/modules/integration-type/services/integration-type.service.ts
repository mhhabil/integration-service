import { Injectable } from '@nestjs/common';
import { IIntegrationType } from '../interfaces/integration-type';
import { IntegrationTypeCreateDto } from '../dtos/integration-type.dto';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';

@Injectable()
export class IntegrationTypeService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async create(integrationTypes: IntegrationTypeCreateDto[], userId: string) {
    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(`IntegrationType`, '.');
    if (result && result !== null) {
      const params = {
        integration_types: integrationTypes,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(`IntegrationType`, '$', params);
    } else {
      const params = {
        integration_types: integrationTypes,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(`IntegrationType`, '$', params);
    }
  }

  async findAll(): Promise<IIntegrationType> {
    const result = await this.redisService.get(`IntegrationType`, '.');
    return result;
  }
}
