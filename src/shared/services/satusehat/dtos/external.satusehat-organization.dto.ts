import { ISatuSehatOrganizationCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-organization-create.dto';

interface Identifier {
  use: string;
  system: string;
  value: string;
}

interface Type {
  coding: Coding[];
}

interface Coding {
  system: string;
  code: string;
  display: string;
}

interface Telecom {
  system: string;
  value: string;
  use: string;
}

interface Address {
  use: string;
  type: string;
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

interface PartOf {
  reference: string;
}

export class ExternalSatuSehatOrganizationDto {
  resourceType: string;
  active: boolean;
  identifier: Identifier[];
  type: Type[];
  name: string;
  telecom: Telecom[];
  address: Address[];
  partOf: PartOf;

  constructor(req: ISatuSehatOrganizationCreateDto, id: string) {
    this.resourceType = 'Organization';
    this.active = true;
    this.identifier = [
      {
        use: 'official',
        system: `http://sys-ids.kemkes.go.id/organization/${id}`,
        value: req.identifier_value,
      },
    ];
    this.type = [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'dept',
            display: 'Hospital Department',
          },
        ],
      },
    ];
    this.name = req.name;
    this.telecom = [
      {
        system: 'phone',
        value: req.phone,
        use: 'work',
      },
      {
        system: 'email',
        value: req.email,
        use: 'work',
      },
      {
        system: 'url',
        value: req.website,
        use: 'work',
      },
    ];
    this.address = [
      {
        use: 'work',
        type: 'both',
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
            ],
          },
        ],
      },
    ];
    this.partOf = {
      reference: `Organization/${id}`,
    };
  }

  static createRequest(json: ISatuSehatOrganizationCreateDto, id: string) {
    return new ExternalSatuSehatOrganizationDto(json, id);
  }
}
