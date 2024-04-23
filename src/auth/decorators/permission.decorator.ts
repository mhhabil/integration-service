import { SetMetadata } from '@nestjs/common';

import { ModulePermission } from '../authorization.interface';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (permissions: ModulePermission) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
