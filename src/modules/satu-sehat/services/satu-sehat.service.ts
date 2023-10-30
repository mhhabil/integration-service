import { Injectable } from '@nestjs/common';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { SatuSehatInformationDto } from '../dtos/satu-sehat-information-create.dto';

@Injectable()
export class SatuSehatService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async informationCreate(request: SatuSehatInformationDto, userId: string) {
    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(
      `Information:{${request.hospital_id}}:satusehat`,
      '.',
    );
    if (result && result !== null) {
      const params = {
        ...request,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${request.hospital_id}}:satusehat`,
        '$',
        params,
      );
    } else {
      const params = {
        ...request,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${request.hospital_id}}:satusehat`,
        '$',
        params,
      );
    }
  }

  async findInformationById(
    hospitalId: string,
  ): Promise<SatuSehatInformationDto> {
    const result = await this.redisService.get(
      `Information:{${hospitalId}}:satusehat`,
      '.',
    );
    return result;
  }
}
