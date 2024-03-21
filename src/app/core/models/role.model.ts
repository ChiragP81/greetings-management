import {
  ActionToolbar,
  EntityList,
  EntityParams,
  FormControlMap
} from '@models/common.model';

export interface Role {
  _id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  action: ActionToolbar[];
  permissions: string[];
}

export interface Permission {
  _id: string;
  name: string;
  description?: string;
}

export interface CreateRole {
  name: string;
}

export interface RoleListQueryParams extends EntityParams {
  cmsId: string;
}

export interface RoleList extends EntityList<Role> { }

export type AddRoleForm = FormControlMap<CreateRole>;

export interface Permissions {
  moduleName: string;
  permissions: Permission[];
}
