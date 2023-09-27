import { Injectable } from '@nestjs/common';
import * as jp from 'jsonpath';

import { Action } from './authorization.interface';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ReJson } from '../shared/rejson';

@Injectable()
export class AuthService {
  protected rejson: ReJson;
  payload;
  constructor(private redisService: RedisService) {
    const cl = this.redisService.getClient('RBAC');
    this.rejson = new ReJson(cl);
  }

  isExist = async (id: string): Promise<boolean> => {
    const result = await this.getEmployeeId(id);
    return result != null && typeof result == 'string';
  };

  getEmployeeId = async (id: string): Promise<string> => {
    return await this.rejson.get(id, '.employee_id');
  };

  getModules = async (id: string): Promise<[]> => {
    return await this.rejson.get(id, '.modules');
  };

  hasModule = async (id, module: string): Promise<boolean> => {
    const result = jp.query(
      await this.getModules(id),
      '$[?(@.module_code=="' + module + '")]',
    );
    return result.length > 0;
  };

  hasAbility = async (
    id: string,
    action: Action,
    module: string,
  ): Promise<boolean> => {
    const result = jp.query(
      await this.getModules(id),
      '$[?(@.module_code=="' + module + '")]',
    );
    console.log('RESULT HAS ABILITY', result);
    if (result && result.length > 0) return result[0][action];
    else return false;
  };

  async getCompanies(id: string): Promise<Array<string>> {
    return await this.rejson.get(id, '.company_list');
  }

  getRole = async (id: string): Promise<string> => {
    return await this.rejson.get(id, '.role');
  };

  getDivisions = async (id: string): Promise<Array<string>> => {
    return await this.rejson.get(id, '.divisi_list');
  };

  getLocations = async (id: string): Promise<Array<string>> => {
    return await this.rejson.get(id, '.location_list');
  };

  isSuper = async (id: string): Promise<boolean> => {
    return (await this.getRole(id)) == 'super';
  };
}
