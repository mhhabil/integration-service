import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '../../config.service';
import { MessagingRequestDto } from '../dtos/messaging-request.dto';
import data from '../mocks/bundle-data-by-date';

@Injectable()
export class MessagingService {
  constructor(
    private readonly _httpService: HttpService,
    private readonly _configService: ConfigService,
  ) {}

  async getBundleDataByDate(params: MessagingRequestDto, token: string) {
    // const { data } = await firstValueFrom(
    //   this._httpService
    //     .get(
    //       `${this._configService.messaging.url}/integration/satusehat?hospital_id=${params.hospital_id}&date=${params.date}&type=${params.service_type}`,
    //       {
    //         headers: {
    //           'x-token': token,
    //         },
    //       },
    //     )
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         throw error.message;
    //       }),
    //     ),
    // );
    return data;
  }
}
