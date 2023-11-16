import { Injectable } from '@nestjs/common';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { SatuSehatInformationDto } from '../dtos/satu-sehat-information-create.dto';
import { ExternalSatuSehatService } from 'src/shared/services/satusehat/external.satusehat.service';
import { ISatuSehatOrganizationCreateDto } from '../dtos/satu-sehat-organization-create.dto';
import { ISatuSehatLocationCreateDto } from '../dtos/satu-sehat-location-create.dto';

@Injectable()
export class SatuSehatService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
    private externalSatusehatService: ExternalSatuSehatService,
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

  async findPractitionerByNIK(hospital_id: string, nik: string) {
    const data = await this.externalSatusehatService.getIHSPractitioner(
      hospital_id,
      nik,
    );
    if (data && data.resource) {
      const nameArray: any[] = data.resource.name;
      const identifiers = data.resource.identifier;
      const ihs = identifiers.find((i) => i.system.includes('his-number'));
      const nik = identifiers.find((i) => i.system.includes('nik'));
      const name =
        Array.isArray(nameArray) && nameArray[0] && nameArray[0].text
          ? nameArray[0].text
          : '';

      return {
        url: data.fullUrl,
        ihs_number: ihs ? ihs.value : null,
        nik: nik ? nik.value : null,
        name,
      };
    } else {
      return undefined;
    }
  }

  async findPatientByNIK(hospital_id: string, nik: string) {
    const data = await this.externalSatusehatService.getIHSPatient(
      hospital_id,
      nik,
    );
    if (data && data.resource) {
      const nameArray: any[] = data.resource.name;
      const identifiers = data.resource.identifier;
      const ihs = identifiers.find((i) => i.system.includes('ihs-number'));
      const name =
        Array.isArray(nameArray) && nameArray[0] && nameArray[0].text
          ? nameArray[0].text
          : '';

      return {
        url: data.fullUrl,
        ihs_number: ihs ? ihs.value : null,
        nik,
        name,
      };
    } else {
      return undefined;
    }
  }

  async findOrganizationById(hospital_id: string) {
    const data =
      await this.externalSatusehatService.getOrganizationByPartOf(hospital_id);
    return data;
  }

  async createOrganization(payload: ISatuSehatOrganizationCreateDto) {
    const information = await this.redisService.get(
      `Information:{${payload.hospital_id}}:satusehat`,
      '.',
    );
    const id = await this.externalSatusehatService.createOrganization(
      payload,
      information.organization_id,
    );
    return id;
  }

  async findLocationById(hospital_id: string, orgId: string) {
    const data = await this.externalSatusehatService.getLocationByOrgId(
      hospital_id,
      orgId,
    );
    return data;
  }

  async createLocation(payload: ISatuSehatLocationCreateDto) {
    const id = await this.externalSatusehatService.createLocation(payload);
    return id;
  }
}
