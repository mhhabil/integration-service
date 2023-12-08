import { ISatuSehatLocationCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-location-create.dto';

interface Identifier {
  system: string;
  value: string;
}

interface Telecom {
  system: string;
  value: string;
  use?: string;
}

interface Address {
  use: string;
  line: string[];
  city: string;
  postalCode: string;
  country: string;
  extension: Extension[];
}

interface Extension {
  url: string;
  extension: Extension2[];
}

interface Extension2 {
  url: string;
  valueCode: string;
}

interface PhysicalType {
  coding: Coding[];
}

interface Coding {
  system: string;
  code: string;
  display: string;
}

interface Position {
  longitude: number;
  latitude: number;
  altitude: number;
}

interface ManagingOrganization {
  reference: string;
}

export class ExternalSatuSehatLocationDto {
  resourceType: string;
  identifier: Identifier[];
  status: string;
  name: string;
  description: string;
  mode: string;
  telecom: Telecom[];
  address: Address;
  physicalType: PhysicalType;
  position: Position;
  managingOrganization: ManagingOrganization;

  constructor(req: ISatuSehatLocationCreateDto) {
    const id = Math.floor(100000 + Math.random() * 900000);
    this.resourceType = 'Location';
    this.identifier = [
      {
        system: `http://sys-ids.kemkes.go.id/location/0${id}`,
        value: req.code,
      },
    ];
    this.status = 'active';
    this.name = req.label;
    this.description = req.description;
    this.mode = 'instance';
    this.telecom = [
      {
        system: 'phone',
        value: req.phone,
        use: 'work',
      },
      {
        system: 'fax',
        value: req.fax,
        use: 'work',
      },
      {
        system: 'email',
        value: req.email,
      },
      {
        system: 'url',
        value: req.website,
        use: 'work',
      },
    ];
    this.address = {
      use: 'work',
      line: [req.address],
      city: req.city_name,
      postalCode: req.postal_code,
      country: 'ID',
      extension: [
        {
          url: 'https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode',
          extension: [
            {
              url: 'province',
              valueCode: req.address_extension.province_code,
            },
            {
              url: 'city',
              valueCode: req.address_extension.city_code,
            },
            {
              url: 'district',
              valueCode: req.address_extension.district_code,
            },
            {
              url: 'village',
              valueCode: req.address_extension.village_code,
            },
            {
              url: 'rt',
              valueCode: req.address_extension.rt,
            },
            {
              url: 'rw',
              valueCode: req.address_extension.rw,
            },
          ],
        },
      ],
    };
    this.physicalType = {
      coding: [
        {
          system:
            'http://terminology.hl7.org/CodeSystem/location-physical-type',
          code: 'ro',
          display: 'Room',
        },
      ],
    };
    this.position = {
      longitude: req.position.longitude,
      latitude: req.position.latitude,
      altitude: req.position.altitude,
    };
    this.managingOrganization = {
      reference: `Organization/${req.organization_id}`,
    };
  }

  static createRequest(json: ISatuSehatLocationCreateDto) {
    return new ExternalSatuSehatLocationDto(json);
  }
}
