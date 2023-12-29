import { Injectable } from '@nestjs/common';

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
    const d = new Date(date);
    const dateFormat = `${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear().toString().padStart(4, '0')} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    return dateFormat;
  }
}
