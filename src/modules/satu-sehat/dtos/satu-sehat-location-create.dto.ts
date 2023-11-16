interface IExtension {
  province_code: string;
  city_code: string;
  district_code: string;
  village_code: string;
  rt: string;
  rw: string;
}

interface IPosition {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface ISatuSehatLocationCreateDto {
  hospital_id: string;
  organization_id: string;
  code: string;
  label: string;
  description: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  address: string;
  city_name: string;
  postal_code: string;
  address_extension: IExtension;
  position: IPosition;
}
