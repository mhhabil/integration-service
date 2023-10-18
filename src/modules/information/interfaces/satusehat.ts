import { Information } from './information';

export interface SatuSehat extends Information {
  organization_id: string;
  client_key: string;
  secret_key: string;
}
