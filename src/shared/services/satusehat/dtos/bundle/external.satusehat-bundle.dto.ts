import { SatuSehatBundleCreateDto } from 'src/modules/satu-sehat/dtos/satu-sehat-bundle-create.dto';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { v4 as uuid } from 'uuid';

export interface Entry {
  fullUrl: string;
  resource: Resource;
  request: Request;
}

export interface Resource {
  resourceType: string;
  status?: string;
  class?: Class;
  subject: Subject;
  participant?: Participant[];
  period?: Period;
  location?: Location[];
  diagnosis?: Diagnosis[];
  statusHistory?: StatusHistory[];
  serviceProvider?: ServiceProvider;
  identifier?: Identifier[];
  clinicalStatus?: ClinicalStatus;
  category?: Category[];
  code?: Code;
  encounter?: Encounter;
}

export interface Class {
  system: string;
  code: string;
  display: string;
}

export interface Subject {
  reference: string;
  display: string;
}

export interface Participant {
  type: Type[];
  individual: Individual;
}

export interface Type {
  coding: Coding[];
}

export interface Coding {
  system: string;
  code: string;
  display: string;
}

export interface Individual {
  reference: string;
  display: string;
}

export interface Period {
  start: string;
  end: string;
}

export interface Location {
  location: Location2;
}

export interface Location2 {
  reference: string;
  display: string;
}

export interface Diagnosis {
  condition: Condition;
  use: Use;
  rank: number;
}

export interface Condition {
  reference: string;
  display: string;
}

export interface Use {
  coding: Coding2[];
}

export interface Coding2 {
  system: string;
  code: string;
  display: string;
}

export interface StatusHistory {
  status: string;
  period: Period2;
}

export interface Period2 {
  start: string;
  end: string;
}

export interface ServiceProvider {
  reference: string;
}

export interface Identifier {
  system: string;
  value: string;
}

export interface ClinicalStatus {
  coding: Coding3[];
}

export interface Coding3 {
  system: string;
  code: string;
  display: string;
}

export interface Category {
  coding: Coding4[];
}

export interface Coding4 {
  system: string;
  code: string;
  display: string;
}

export interface Code {
  coding: Coding5[];
}

export interface Coding5 {
  system: string;
  code: string;
  display: string;
}

export interface Encounter {
  reference: string;
  display: string;
}

export interface Request {
  method: string;
  url: string;
}

export class SatuSehatBundleModel {
  resourceType: string;
  type: string;
  entry: Entry[];

  constructor(
    model: SatuSehatBundleCreateDto,
    private datetimeService: DatetimeService,
  ) {
    const encounterid = uuid();
    const uuids = model.icd_x.map(() => uuid());
    const diagnosis = model.icd_x.map((value, key) => {
      return {
        condition: {
          reference: `urn:uuid:${uuids[key]}`,
          display: value.display,
        },
        use: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
              code: 'DD',
              display: 'Discharge diagnosis',
            },
          ],
        },
        rank: key + 1,
      };
    });

    const conditions = model.icd_x.map((value, key) => {
      return {
        fullUrl: `urn:uuid:${uuids[key]}`,
        resource: {
          resourceType: 'Condition',
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active',
              },
            ],
          },
          category: [
            {
              coding: [
                {
                  system:
                    'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'encounter-diagnosis',
                  display: 'Encounter Diagnosis',
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: value.id,
                display: value.display,
              },
            ],
          },
          subject: {
            reference: `Patient/${model.patient_ihs}`,
            display: model.patient_name,
          },
          encounter: {
            reference: `urn:uuid:${encounterid}`,
            display: `Kunjungan ${
              model.patient_name
            } pada ${datetimeService.getCurrentDate()}`,
          },
        },
        request: {
          method: 'POST',
          url: 'Condition',
        },
      };
    });

    this.resourceType = 'Bundle';
    this.type = 'transaction';
    this.entry = [
      {
        fullUrl: `urn:uuid:${encounterid}`,
        resource: {
          resourceType: 'Encounter',
          status: 'finished',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'ambulatory',
          },
          subject: {
            reference: `Patient/${model.patient_ihs}`,
            display: model.patient_name,
          },
          participant: [
            {
              type: [
                {
                  coding: [
                    {
                      system:
                        'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                      code: 'ATND',
                      display: 'attender',
                    },
                  ],
                },
              ],
              individual: {
                reference: `Practitioner/${model.doctor_ihs}`,
                display: model.doctor_name,
              },
            },
          ],
          period: {
            start: `${datetimeService.getCurrentDate()}T${
              model.start_time
            }+07:00`,
            end: `${datetimeService.getCurrentDate()}T${model.end_time}+07:00`,
          },
          location: [
            {
              location: {
                reference: `Location/${model.location.id}`,
                display: model.location.name,
              },
            },
          ],
          diagnosis,
          statusHistory: [
            {
              status: 'arrived',
              period: {
                start: `${datetimeService.getCurrentDate()}T${
                  model.start_time
                }+07:00`,
                end: `${datetimeService.getCurrentDate()}T${
                  model.start_time
                }+07:00`,
              },
            },
            {
              status: 'in-progress',
              period: {
                start: `${datetimeService.getCurrentDate()}T${
                  model.start_time
                }+07:00`,
                end: `${datetimeService.getCurrentDate()}T${
                  model.end_time
                }+07:00`,
              },
            },
            {
              status: 'finished',
              period: {
                start: `${datetimeService.getCurrentDate()}T${
                  model.end_time
                }+07:00`,
                end: `${datetimeService.getCurrentDate()}T${
                  model.end_time
                }+07:00`,
              },
            },
          ],
          serviceProvider: {
            reference: `Organization/${model.organization_id}`,
          },
          identifier: [
            {
              system: `http://sys-ids.kemkes.go.id/encounter/${encounterid}`,
              value: `${model.mr}/${model.treatment_no}`,
            },
          ],
        },
        request: {
          method: 'POST',
          url: 'Encounter',
        },
      },
      ...conditions,
    ];
  }
}
