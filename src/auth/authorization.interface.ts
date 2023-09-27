export enum Action {
  READ = 'tread',
  CREATE = 'tcreate',
  UPDATE = 'tupdate',
  DELETE = 'tdelete',
}

export enum Role {
  Super = 'super',
  Admin = 'admin',
  Staff = 'staff',
}

export interface ModulePermission {
  name: string;
  action: Action;
}
