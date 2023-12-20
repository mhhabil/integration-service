import { Injectable } from '@nestjs/common';
import { SatuSehatBundleCreateDto } from '../dtos/satu-sehat-bundle-create.dto';

@Injectable()
export class SatusehatTypeService {
  constructor() {}

  checkPhase1(data: SatuSehatBundleCreateDto) {
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

  checkPhase2() {
    return false;
  }

  checkPhase3() {
    return false;
  }

  checkPhase4() {
    return false;
  }

  checkPhase5() {
    return false;
  }

  type(data: SatuSehatBundleCreateDto) {
    return {
      phase_1: !!this.checkPhase1(data),
      phase_2: this.checkPhase2(),
      phase_3: this.checkPhase3(),
      phase_4: this.checkPhase4(),
      phase_5: this.checkPhase5(),
    };
  }
}
