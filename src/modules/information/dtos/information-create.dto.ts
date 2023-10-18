export interface IInformationCreateDto {
  hospital_id: string;
}

export class InformationCreateDto {
  hospital_id: string;

  constructor(params: IInformationCreateDto) {
    this.hospital_id = params.hospital_id;
  }

  static create(body: IInformationCreateDto) {
    return new InformationCreateDto(body);
  }
}
