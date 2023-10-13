import { Injectable } from '@nestjs/common';
import { Information } from '../interfaces/information';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { InformationCreateDto } from '../dtos/information-create.dto';

@Injectable()
export class InformationService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async create(information: InformationCreateDto, userId: string) {
    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(
      `Information:{${information.hospital_id}}:${information.integration_type_id}`,
      '.',
    );
    const company = await this.redisService.getCompany(information.hospital_id);
    const integrationType = await this.redisService.getIntegrationType(
      information.integration_type_id,
    );
    if (result && result !== null) {
      const params = {
        ...information,
        integration_type_name: integrationType.name,
        hospital_name: company.name,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${params.hospital_id}}:${params.integration_type_id}`,
        '$',
        params,
      );
    } else {
      const params = {
        ...information,
        integration_type_name: integrationType.name,
        hospital_name: company.name,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${params.hospital_id}}:${params.integration_type_id}`,
        '$',
        params,
      );
    }
  }

  async findById(id: string, typeId: string): Promise<Information> {
    const result = await this.redisService.get(
      `Information:{${id}}:${typeId}`,
      '.',
    );
    return result;
  }
}
