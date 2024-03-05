import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class DatetimeService {
  constructor() {}

  getCurrentDatetime() {
    const d = new Date();
    const dateFormat = `${d.getFullYear().toString().padStart(4, '0')}-${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return dateFormat;
  }

  getCurrentDate() {
    const d = new Date();
    const dateFormat = `${d.getFullYear().toString().padStart(4, '0')}-${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    return dateFormat;
  }

  getNormalDate(date: Date) {
    const d = new Date(date);
    const dateFormat = `${d.getFullYear().toString().padStart(4, '0')}-${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    return dateFormat;
  }

  getLocalDatetime(date: string) {
    const dateFormat = moment(date)
      .utcOffset('+07:00')
      .format('YYYY-MM-DD HH:mm:ss');
    return dateFormat;
  }

  static convertToNormalDatetime(date?: any) {
    const d = date ? new Date(date) : new Date();
    const dateFormat = `${d.getFullYear().toString().padStart(4, '0')}-${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return dateFormat;
  }
}
