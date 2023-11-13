import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import { RedisSharedService } from '../redis.service';

@Injectable()
export class ExternalSatuSehatService {
  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisSharedService,
  ) {}

  async oauth(hospital_id: string) {
    const information = await this.redisService.get(
      `Information:{${hospital_id}}:satusehat`,
      '.',
    );
    const config = await this.redisService.get(`Config:SatuSehat`, '.');
    const { data } = await firstValueFrom(
      this.httpService
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
            console.log(error);
            throw 'Error';
          }),
        ),
    );
    return data;
  }

  async getIHSPractitioner(hospital_id: string, nik: string) {
    const config = await this.redisService.get(`Config:SatuSehat`, '.');
    const token = await this.redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const { data } = await firstValueFrom(
      this.httpService
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
            console.log(error);
            throw 'Error';
          }),
        ),
    );
    return data.entry && Array.isArray(data.entry) && data.entry[0]
      ? data.entry[0]
      : {};
  }

  async getIHSPatient(hospital_id: string, nik: string) {
    const config = await this.redisService.get(`Config:SatuSehat`, '.');
    const token = await this.redisService.get(
      `Auth:{SatuSehat}:${hospital_id}`,
      'access_token',
    );
    const { data } = await firstValueFrom(
      this.httpService
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
            console.log(error);
            throw 'Error';
          }),
        ),
    );
    return data.entry && Array.isArray(data.entry) && data.entry[0]
      ? data.entry[0]
      : {};
  }
}
