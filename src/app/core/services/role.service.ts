import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, catchError, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { API } from '@constants/api.constants';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import {
  Permission,
  Role,
  RoleList,
  RoleListQueryParams
} from '@models/role.model';
import { BaseApiService } from '@services/base-api.service';

export const RoleDetail = (route: ActivatedRouteSnapshot) => {
  const cmsService = inject(RoleService);
  const router = inject(Router);
  return cmsService.getById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/roles/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseApiService<
  Role,
  RoleList,
  RoleListQueryParams
> {
  private httpClient = inject(HttpClient);

  getEndpoint(): string {
    return API.ROLES;
  }

  getAllPermissions() {
    return this.httpClient.get<APIResponseModel<Permission[]>>(
      API.PERMISSIONS
    );
  }

  getRoleList(): Observable<OptionDetail[]> {
    return this.httpClient
      .get<APIResponseModel<Pick<Role, '_id' | 'name'>[]>>(
        `${this.getEndpoint()}?isDropdown=true`
      )
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return { label: element.name, value: element._id };
          });
        })
      );
  }
}
