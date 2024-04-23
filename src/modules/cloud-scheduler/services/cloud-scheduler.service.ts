import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from 'src/shared/services/config.service';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { LoggerService } from 'src/shared/services/logger.service';
import { DatetimeService } from 'src/shared/services/datetime.service';
import * as moment from 'moment';

@Injectable()
export class CloudSchedulerService {
  constructor(
    private readonly _httpService: HttpService,
    private readonly _configService: ConfigService,
    private readonly _loggerService: LoggerService,
    private readonly _datetimeService: DatetimeService,
  ) {}

  async getSatusehat() {
    const token = await this.getAppToken();
    await firstValueFrom(
      this._httpService
        .get(`http://127.0.0.1:3412/satu-sehat/bundle`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/cloud-scheduler/satusehat',
              'ALL',
              {
                timestamp: moment()
                  .utcOffset('+07:00')
                  .format('YYYY-MM-DD HH:mm:ss'),
              },
              error.response.data as any,
            );
            throw error.message;
          }),
        ),
    );

    this._loggerService.elasticInfo(
      '/cloud-scheduler/satusehat',
      'ALL',
      {
        timestamp: moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        timestamp: moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss'),
      },
    );
  }

  async getAppToken() {
    const { data } = await firstValueFrom(
      this._httpService
        .post(
          `${this._configService.messaging.url}/user/loginApp`,
          {
            app_id: '94371e58-7094-11e9-a923-1681be663d3e',
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
              '/cloud-scheduler/get-token',
              'TOKEN',
              {
                timestamp: moment()
                  .utcOffset('+07:00')
                  .format('YYYY-MM-DD HH:mm:ss'),
              },
              error.response.data as object,
            );
            throw error.message;
          }),
        ),
    );
    return data.token;
  }
}
