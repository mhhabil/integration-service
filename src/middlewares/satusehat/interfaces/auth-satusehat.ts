export interface IAuthSatuSehat {
  refresh_token_expires_in: string;
  api_product_list: string;
  api_product_list_json: string[];
  organization_name: string;
  'developer.email': string;
  token_type: string;
  issued_at: string;
  client_id: string;
  access_token: string;
  application_name: string;
  scope: string;
  expires_in: string;
  refresh_count: string;
  status: string;
}

export class AuthSatuSehat {
  refresh_token_expires_in: string;
  api_product_list: string;
  api_product_list_json: string[];
  organization_name: string;
  'developer.email': string;
  token_type: string;
  issued_at: string;
  client_id: string;
  access_token: string;
  application_name: string;
  scope: string;
  expires_in: string;
  expired_at: string;
  expired_utc: string;
  refresh_count: string;
  status: string;

  constructor(model: IAuthSatuSehat) {
    const curr = new Date();
    const milis = parseInt(model.expires_in) * 1000;
    const expiredAt: any = new Date(curr.getTime() + milis);
    const utcDate: any = expiredAt.toLocaleString();

    this.refresh_token_expires_in = model.refresh_token_expires_in;
    this.api_product_list = model.api_product_list;
    this.api_product_list_json = model.api_product_list_json;
    this.organization_name = model.organization_name;
    this['developer.email'] = model['developer.email'];
    this.token_type = model.token_type;
    this.issued_at = model.issued_at;
    this.client_id = model.client_id;
    this.access_token = model.access_token;
    this.application_name = model.application_name;
    this.scope = model.scope;
    this.expires_in = model.expires_in;
    this.expired_at = expiredAt;
    this.expired_utc = utcDate;
    this.refresh_count = model.refresh_count;
    this.status = model.status;
  }

  static create(payload: IAuthSatuSehat) {
    return new AuthSatuSehat(payload);
  }
}
