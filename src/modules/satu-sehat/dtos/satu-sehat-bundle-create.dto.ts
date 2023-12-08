interface LocationMinified {
  id: string;
  name: string;
}

interface ICDX {
  id: string;
  display: string;
}

export interface SatuSehatBundleCreateDto {
  mr: string;
  treatment_no: string;
  patient_name: string;
  patient_nik: string;
  patient_ihs: string;
  doctor_name: string;
  doctor_nik: string;
  doctor_ihs: string;
  start_time: string;
  end_time: string;
  icd_x: ICDX[];
  icd_ix: string;
  encounter_ends: string;
  location: LocationMinified;
  organization_id: string;
}
