export interface ILogDetail {
  timestamp: string;
  branch: string;
  treatment: string;
  status: 'success' | 'error';
}

export class LogDetail {
  timestamp: string;
  branch: string;
  treatment: string;
  status: 'success' | 'error';

  constructor(model: ILogDetail) {
    this.timestamp = model.timestamp;
    this.branch = model.branch;
    this.treatment = model.treatment;
    this.status = model.status;
  }

  static create(params: ILogDetail) {
    return new LogDetail(params);
  }
}
