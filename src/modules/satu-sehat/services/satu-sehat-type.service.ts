import { Injectable } from '@nestjs/common';
import { SatuSehatBundleCreateDto } from '../dtos/satu-sehat-bundle-create.dto';

@Injectable()
export class SatusehatTypeService {
  constructor() {}

  check(data: SatuSehatBundleCreateDto) {
    const typeError = [];
    if (!data.doctor_ihs) {
      typeError.push('doctor_ihs');
    }
    if (!data.icd_x) {
      typeError.push('icd_x');
    }
    if (!data.patient_ihs) {
      typeError.push('patient_ihs');
    }
    if (!data.start_time) {
      typeError.push('start_time');
    }
    if (!data.end_time) {
      typeError.push('end_time');
    }
    return typeError;
  }
}
