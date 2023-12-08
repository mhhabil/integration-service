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
              '/practitioner',
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
    console.log('data', data);
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
              '/patient',
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
            console.log(error);
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
              '/organization',
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
            console.log(error);
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
    const { data, status } = await firstValueFrom(
      this._httpService
        .post(`${config.base_url}/Location`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/location',
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
}