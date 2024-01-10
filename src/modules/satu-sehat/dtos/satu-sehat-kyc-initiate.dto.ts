export interface ISatusehatKycInitiateDto {
  hospital_id: string;
  employee_id: string;
  employee_nik: string;
  employee_name: string;
}

export class SatusehatKycInitiateDto {
  agent_name: string;
  agent_nik: string;
  public_key: string;

  constructor(req: ISatusehatKycInitiateDto, publicKey: string) {
    this.agent_name = req.employee_name;
    this.agent_nik = req.employee_nik;
    this.public_key = publicKey;
  }

  static create(params: ISatusehatKycInitiateDto, publicKey: string) {
    return new SatusehatKycInitiateDto(params, publicKey);
  }
}

export interface IGetSatusehatKyc {
  employee_id: string;
  employee_nik: string;
  employee_name: string;
  hospital_id: string;
}
