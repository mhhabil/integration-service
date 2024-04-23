interface IExtension {
  province_code: string;
  city_code: string;
  district_code: string;
  village_code: string;
}

export interface ISatuSehatOrganizationCreateDto {
  hospital_id: string;
  identifier_value: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city_name: string;
  postal_code: string;
  address_extension: IExtension;
}
