import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { API } from '@constants/api.constants';
import { ROLES } from '@constants/permission.constant';
import { STORAGE } from '@constants/storage.constant';
import { APIResponseModel } from '@models/common.model';
import {
  Configuration,
  CreateMember,
  Member,
  MemberList,
  MemberListQueryParams
} from '@models/member.model';
import { BaseApiService } from '@services/base-api.service';
import { catchError, tap } from 'rxjs';
import { StorageService } from './storage.service';

export const MemberDetail = (route: ActivatedRouteSnapshot) => {
  const memberService = inject(MemberService);
  const router = inject(Router);
  return memberService.getMemberById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/member/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseApiService<
  Member,
  MemberList,
  MemberListQueryParams
> {
  private httpClient = inject(HttpClient);
  private storageService = inject(StorageService);
  permissions: string[];

  getEndpoint(): string {
    return API.MEMBERS;
  }

  getMembers(params: Partial<MemberListQueryParams>) {
    const httpParams = this.createHttpParamsFromPartial(params);
    return this.httpClient
      .get<APIResponseModel<MemberList>>(this.getEndpoint(), {
        params: httpParams
      })
      .pipe(
        tap((res) => {
          res.data.list.forEach((element) => {
            element.name = `${element.firstName} ${element.lastName}`;
          });
        })
      );
  }

  getMemberById(id: string) {
    return this.httpClient
      .get<APIResponseModel<Member>>(`${this.getEndpoint()}/${id}`);
    // .pipe(
    //   tap((res) => {
    //     res.data.role = res.data.roles.map((role) => role._id);
    //   })
    // );
  }

  getMyPermissions() {
    return this.httpClient
      .get<APIResponseModel<{ permissions: string[]; }>>(API.MY_PERMISSIONS)
      .pipe(
        tap((res) => {
          this.storageService.set(STORAGE.MY_PERMISSIONS, res.data.permissions);
        })
      );
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.storageService.get(STORAGE.USER_ROLES);
    return permissions?.includes(permissionName);
  }

  hasRole(): boolean {
    const roles = this.storageService.get(STORAGE.USER_ROLES);
    return roles === ROLES.ADMIN;
  }

  getProfileDetail(userId: string) {
    return this.httpClient.get<APIResponseModel<Member>>(`${API.PROFILE}/${userId}`);
  }

  updateProfileDetail(id: string, payload: Partial<CreateMember>) {
    return this.httpClient.put<APIResponseModel<null>>(
      `${API.PROFILE}/${id}`,
      payload
    );
  }

  updateConfiguration(payload: Partial<Configuration>) {
    return this.httpClient.post<APIResponseModel<null>>(
      API.CONFIGURATION,
      payload
    );
  }
}
