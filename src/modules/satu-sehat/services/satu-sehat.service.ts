import { Injectable } from '@nestjs/common';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { SatuSehatInformationDto } from '../dtos/satu-sehat-information-create.dto';
import { ExternalSatuSehatService } from 'src/shared/services/satusehat/services/external.satusehat.service';
import { ISatuSehatOrganizationCreateDto } from '../dtos/satu-sehat-organization-create.dto';
import { ISatuSehatLocationCreateDto } from '../dtos/satu-sehat-location-create.dto';
import { MessagingService } from 'src/shared/services/messaging/services/messaging.service';
import { IJWTUser } from 'src/auth/jwt-payload.interface';
import { SatusehatTypeService } from './satu-sehat-type.service';
import { LoggerService } from 'src/shared/services/logger.service';
import { SatusehatAuthService } from './satu-sehat-get-token';
import { CloudTasksService } from 'src/shared/services/google-cloud/services/cloud-tasks.service';
import { google } from '@google-cloud/tasks/build/protos/protos';
import { SatuSehatBundleCreateDto } from '../dtos/satu-sehat-bundle-create.dto';
import { SatusehatBundleGetDto } from '../dtos/satu-sehat-bundle-get.dto';

@Injectable()
export class SatuSehatService {
  constructor(
    private redisService: RedisSharedService,
    private datetimeService: DatetimeService,
    private externalSatusehatService: ExternalSatuSehatService,
    private messagingService: MessagingService,
    private satusehatType: SatusehatTypeService,
    private loggerService: LoggerService,
    private satusehatAuthService: SatusehatAuthService,
    private cloudTasksService: CloudTasksService,
  ) {}

  async findStatus(hospitalId: string) {
    const result = await this.redisService.get(
      `Information:{${hospitalId}}:satusehat`,
      '.',
    );

    return !!result;
  }

  async getCompanies(companyList: string[]) {
    const keys = await this.redisService.keyList('Information:*');
    const hospitalIds = keys.map((key) => {
      return key.split(':')[1].replace(/{|}/gi, '');
    });
    const result = hospitalIds.filter((company) =>
      companyList.includes(company),
    );
    return result;
  }

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
    return data.filter((item) => !!item.resource.active);
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

  async findLocationById(hospital_id: string) {
    const organizationId = await this.redisService.get(
      `Information:{${hospital_id}}:satusehat`,
      '.organization_id',
    );
    const data = await this.externalSatusehatService.getLocationByOrgId(
      hospital_id,
      organizationId,
    );
    return data.filter((item) => !!(item.resource.status === 'active'));
  }

  async createLocation(payload: ISatuSehatLocationCreateDto) {
    const organizationId = await this.redisService.get(
      `Information:{${payload.hospital_id}}:satusehat`,
      '.organization_id',
    );
    const id = await this.externalSatusehatService.createLocation({
      ...payload,
      organization_id: organizationId,
    });
    if (id) {
      this.redisService.set(
        `Information:{${payload.hospital_id}}:satusehat`,
        '$.location',
        id,
      );
    }
    return id;
  }

  async getData(params: SatusehatBundleGetDto, user: IJWTUser) {
    for (const hospitalId of params.hospital_ids) {
      const bundles = await this.messagingService.getBundleDataByDate(
        {
          hospital_id: hospitalId,
          date: params.date,
          service_type: params.type,
        },
        user.token,
      );
      const info = await this.redisService.get(
        `Information:{${hospitalId}}:satusehat`,
        '.',
      );
      for (const encounter of bundles.data) {
        const typeError = this.satusehatType.checkPhase1({
          ...encounter,
          location: info.location,
          organization_id: info.organization_id,
        });
        if (typeError.length > 0) {
          this.loggerService.elasticError(
            '/satu-sehat/bundle',
            hospitalId,
            {
              ...encounter,
              location: info.location,
              organization_id: info.organization_id,
            },
            {
              error: true,
              message: `Property "${typeError.join(', ')}" is undefined`,
            },
            { encounter: encounter.treatment_no },
          );
        } else {
          const payload = this.cloudTasksService.createPayload({
            ...encounter,
            location: info.location,
            organization_id: info.organization_id,
          });

          const task: google.cloud.tasks.v2.ITask = {
            httpRequest: {
              httpMethod: 'POST',
              url: `https://integration-service-uhfll65gkq-et.a.run.app/satu-sehat/bundle?hospital_id=${hospitalId}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
              },
              body: payload,
            },
          };
          this.cloudTasksService.createTask(task);
        }
      }
    }
  }

  async getBundles(user: IJWTUser) {
    const keys = await this.redisService.keyList('Information:*');
    const hospitalIds = keys.map((key) => {
      return key.split(':')[1].replace(/{|}/gi, '');
    });
    for (const hospitalId of hospitalIds) {
      const bundles = await this.messagingService.getBundleDataByDate(
        {
          hospital_id: hospitalId,
          date: this.datetimeService.getCurrentDate(),
          service_type: 'RawatJalan',
        },
        user.token,
      );
      const info = await this.redisService.get(
        `Information:{${hospitalId}}:satusehat`,
        '.',
      );
      for (const encounter of bundles.data) {
        const typeError = this.satusehatType.checkPhase1({
          ...encounter,
          location: info.location,
          organization_id: info.organization_id,
        });
        if (typeError.length > 0) {
          this.loggerService.elasticError(
            '/satu-sehat/bundle',
            hospitalId,
            {
              ...encounter,
              location: info.location,
              organization_id: info.organization_id,
            },
            {
              error: true,
              message: `Property "${typeError.join(', ')}" is undefined`,
            },
            { encounter: encounter.treatment_no },
          );
        } else {
          const payload = this.cloudTasksService.createPayload({
            ...encounter,
            location: info.location,
            organization_id: info.organization_id,
          });

          const task: google.cloud.tasks.v2.ITask = {
            httpRequest: {
              httpMethod: 'POST',
              url: `https://integration-service-uhfll65gkq-et.a.run.app/satu-sehat/bundle?hospital_id=${hospitalId}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
              },
              body: payload,
            },
          };
          this.cloudTasksService.createTask(task);
        }
      }
    }
  }

  async postBundleFhir(payload: SatuSehatBundleCreateDto, hospitalId: string) {
    const token = await this.satusehatAuthService.check(hospitalId);
    await this.externalSatusehatService.fhirR4(payload, token, hospitalId);
  }

  async getSimrsData(
    hospital_id: string,
    date: string,
    type: string,
    user: IJWTUser,
  ) {
    const bundles = await this.messagingService.getBundleDataByDate(
      {
        hospital_id,
        date,
        service_type: type,
      },
      user.token,
    );
    const info = await this.redisService.get(
      `Information:{${hospital_id}}:satusehat`,
      '.',
    );
    const typeChecked = bundles.data.map((item) => {
      return {
        ...item,
        ...this.satusehatType.type(item),
        organization_id: info.organization_id,
        location: info.location,
      };
    });

    return typeChecked;
  }
}
