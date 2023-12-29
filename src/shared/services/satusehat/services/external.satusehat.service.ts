import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RedisSharedService } from '../../redis.service';
import { ISatuSehatOrganizationCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-organization-create.dto';
import { ExternalSatuSehatOrganizationDto } from '../dtos/organization/external.satusehat-organization.dto';
import { ISatuSehatLocationCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-location-create.dto';
import { ExternalSatuSehatLocationDto } from '../dtos/location/external.satusehat-location.dto';
import { LoggerService } from '../../logger.service';
import { SatuSehatBundleCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-bundle-create.dto';
import { SatuSehatBundleModel } from '../dtos/bundle/external.satusehat-bundle.dto';

@Injectable()
export class ExternalSatuSehatService {
  constructor(
    private readonly _httpService: HttpService,
    private readonly _redisService: RedisSharedService,
    private readonly _loggerService: LoggerService,
  ) {}

  async oauth(hospital_id: string) {
    const information = await this._redisService.get(
      `Information:{${hospital_id}}:satusehat`,
      '.',
    );
    if (information) {
      const config = await this._redisService.get(`Config:SatuSehat`, '.');
      const { data } = await firstValueFrom(
        this._httpService
          .post(
            `${config.auth_url}/accesstoken?grant_type=client_credentials`,
            {
              client_id: information.client_key,
              client_secret: information.secret_key,
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this._loggerService.elasticError(
                '/accesstoken?grant_type=client_credentials',
                hospital_id,
                error.request,
                error.response,
              );
              throw error.message;
            }),
          ),
      );
      return data;
    } else {
      return {
        error: true,
        message: 'No Client ID or Secret Key',
      };
    }
  }

  async getIHSPractitioner(hospital_id: string, nik: string) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const { data } = await firstValueFrom(
      this._httpService
        .get(
          `${config.base_url}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/practitioner',
              hospital_id,
              {
                nik,
              },
              {
                error,
                message: error.message,
              },
            );
            throw error.message;
          }),
        ),
    );
    return data.entry && Array.isArray(data.entry) && data.entry[0]
      ? data.entry[0]
      : {};
  }

  async getIHSPatient(hospital_id: string, nik: string) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const { data } = await firstValueFrom(
      this._httpService
        .get(
          `${config.base_url}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/patient',
              hospital_id,
              {
                nik,
              },
              {
                error,
                message: error.message,
              },
            );
            throw 'Error';
          }),
        ),
    );
    return data.entry && Array.isArray(data.entry) && data.entry[0]
      ? data.entry[0]
      : {};
  }

  async getOrganizationByPartOf(hospital_id: string) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const partOfId = await this._redisService.get(
      `Information:{${hospital_id}}:satusehat`,
      '.organization_id',
    );
    const { data, status } = await firstValueFrom(
      this._httpService
        .get(`${config.base_url}/Organization?partof=${partOfId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/bundle',
              hospital_id,
              { hospital_id },
              {
                error: true,
                message: error.message,
                data: error.response.data,
              },
            );
            throw 'Error';
          }),
        ),
    );
    return !!(
      status === (HttpStatus.OK || HttpStatus.CREATED) &&
      data &&
      data.entry
    )
      ? data.entry
      : undefined;
  }

  async createOrganization(
    payload: ISatuSehatOrganizationCreateDto,
    id: string,
  ) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${payload.hospital_id}`,
      'access_token',
    );
    const params = ExternalSatuSehatOrganizationDto.createRequest(payload, id);
    const { data, status } = await firstValueFrom(
      this._httpService
        .post(`${config.base_url}/Organization`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/organization',
              payload.hospital_id,
              payload,
              {
                error,
                message: error.message,
              },
            );
            throw 'Error';
          }),
        ),
    );
    return !!(
      status === (HttpStatus.OK || HttpStatus.CREATED) &&
      data &&
      data.id
    )
      ? data.id
      : undefined;
  }

  async getLocationByOrgId(hospital_id: string, orgId: string) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const { data, status } = await firstValueFrom(
      this._httpService
        .get(`${config.base_url}/Location?organization=${orgId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/bundle',
              hospital_id,
              { organization_id: orgId },
              {
                error: true,
                message: error.message,
                data: error.response.data,
              },
            );
            throw 'Error';
          }),
        ),
    );
    return !!(
      status === (HttpStatus.OK || HttpStatus.CREATED) &&
      data &&
      data.entry
    )
      ? data.entry
      : undefined;
  }

  async createLocation(payload: ISatuSehatLocationCreateDto) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${payload.hospital_id}`,
      'access_token',
    );
    const params = ExternalSatuSehatLocationDto.createRequest(payload);
    const { data } = await firstValueFrom(
      this._httpService
        .post(`${config.base_url}/Location`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/location',
              payload.hospital_id,
              payload,
              {
                error,
                message: error.message,
              },
            );
            throw 'Error';
          }),
        ),
    );
    return !!(data && data.id) ? { id: data.id, name: data.name } : undefined;
  }

  async fhirR4(
    payload: SatuSehatBundleCreateDto,
    token: string,
    hospital_id: string,
  ) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const params = SatuSehatBundleModel.createRequest(payload);
    const { data, statusText } = await firstValueFrom(
      this._httpService
        .post(`${config.base_url}`, params, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/bundle',
              hospital_id,
              params,
              {
                error: true,
                message: error.message,
                data: error.response.data,
              },
              { encounter: payload.treatment_no },
            );
            throw error.message;
          }),
        ),
    );
    const logsData =
      data.entry &&
      Array.isArray(data.entry) &&
      data.entry.map((item) => {
        return {
          resourceType: item.response.resourceType,
          status: item.response.status,
          id: item.response.resourceID,
        };
      });
    this._loggerService.elasticInfo(
      '/satu-sehat/bundle',
      hospital_id,
      params,
      {
        error: false,
        message: statusText,
        data: logsData,
      },
      { encounter: payload.treatment_no },
    );
  }
}
