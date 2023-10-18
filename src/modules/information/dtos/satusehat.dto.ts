import {
  IInformationCreateDto,
  InformationCreateDto,
} from './information-create.dto';

export interface ISatuSehatDto extends IInformationCreateDto {
  type_id: 'satusehat';
  organization_id: string;
  client_key: string;
  secret_key: string;
}

export class SatuSehatDto extends InformationCreateDto {
  type_id: 'satusehat';
  organization_id: string;
  client_key: string;
  secret_key: string;

  constructor(param: ISatuSehatDto) {
    super(param);
    this.type_id = 'satusehat';
    this.organization_id = param.organization_id;
    this.client_key = param.client_key;
    this.secret_key = param.secret_key;
  }

  static isBodyType(body: any): body is SatuSehatDto {
    return !!(
      (body as SatuSehatDto).client_key &&
      (body as SatuSehatDto).hospital_id &&
      (body as SatuSehatDto).organization_id &&
      (body as SatuSehatDto).secret_key
    );
  }

  static create(body: ISatuSehatDto) {
    return new SatuSehatDto(body);
  }
}
