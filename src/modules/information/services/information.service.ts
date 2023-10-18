import { Injectable } from '@nestjs/common';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { InformationCreateDto } from '../dtos/information-create.dto';
import { Request } from 'express';
import { IJWTUser } from 'src/auth/jwt-payload.interface';
import { SatuSehatDto } from '../dtos/satusehat.dto';

@Injectable()
export class InformationService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
  ) {}

  async create(request: Request, integrationId: string) {
    const user: IJWTUser = request.user as any;
    const userId = user.id;

    const baseParam = InformationCreateDto.create(request.body);

    const currentDatetime = this.datetimeService.getCurrentDatetime();
    const result = await this.redisService.get(
      `Information:{${baseParam.hospital_id}}:${integrationId}`,
      '.',
    );
    if (result && result !== null) {
      let integrationObject = undefined;
      switch (integrationId) {
        case 'satusehat':
          integrationObject = SatuSehatDto.create(request.body);
          break;
        default:
          break;
      }
      const params = {
        ...integrationObject,
        created_at: result.created_at,
        updated_at: currentDatetime,
        created_by: result.created_by,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${baseParam.hospital_id}}:${integrationId}`,
        '$',
        params,
      );
    } else {
      let integrationObject = undefined;
      switch (integrationId) {
        case 'satusehat':
          integrationObject = SatuSehatDto.create(request.body);
          break;
        default:
          break;
      }
      const params = {
        ...integrationObject,
        created_at: currentDatetime,
        updated_at: currentDatetime,
        created_by: userId,
        updated_by: userId,
      };
      this.redisService.set(
        `Information:{${baseParam.hospital_id}}:${integrationId}`,
        '$',
        params,
      );
    }
  }

  async findById(id: string, typeId: string): Promise<any> {
    const result = await this.redisService.get(
      `Information:{${id}}:${typeId}`,
      '.',
    );
    return result;
  }
}
