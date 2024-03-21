import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

import { API } from '@constants/api.constants';
import { STORAGE } from '@constants/storage.constant';
import {
  AuthPayload,
  ChangePasswordPayload
} from '@models/auth.model';
import { APIResponseModel } from '@models/common.model';
import { MemberService } from '@services/member.service';
import { StorageService } from '@services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private memberService: MemberService
  ) { }

  login(params: AuthPayload) {
    return this.http
      .post<APIResponseModel<any>>(API.LOGIN, params);
    // .pipe(
    //   switchMap((member) => {
    //     this.storageService.set(STORAGE.LOGIN_TOKEN, member.data.token);
    //     this.storageService.set(STORAGE.USER_ROLES, member.data.role);
    //     this.storageService.set(STORAGE.USER_DATA, member.data);
    //     this.storageService.set(
    //       STORAGE.FULL_NAME,
    //       `${member.data.firstName} ${member.data.lastName}`
    //     );
    //     this.memberService.permissions = member.data.permissions;
    //     return member;
    //     // return this.memberService.getMyPermissions().pipe(
    //     //   map((res) => {
    //     //     this.memberService.permissions = res.data.permissions;
    //     //     return member;
    //     //   })
    //     // );
    //   })
    // );
  }

  forgotPassword(params: Pick<AuthPayload, 'email'>) {
    return this.http.post<APIResponseModel<null>>(API.FORGOT_PASSWORD, params);
  }

  setPassword(params: Omit<AuthPayload, 'email'>) {
    return this.http.post<APIResponseModel<null>>(API.RESET_PASSWORD, params);
  }

  changePassword(payload: ChangePasswordPayload) {
    return this.http
      .post<APIResponseModel<{ token: string; }>>(API.CHANGE_PASSWORD, payload)
      .pipe(
        tap((res) =>
          this.storageService.set(STORAGE.LOGIN_TOKEN, res.data.token)
        )
      );
  }
}
