import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel } from '@models/common.model';
import { Artefacts, DashboardCounts } from '@models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  readonly awsUrl = environment.awsUrl;
  constructor(private http: HttpClient) {}

  getCounts() {
    return this.http.get<APIResponseModel<DashboardCounts>>(API.DASHBOARD).pipe(
      tap((res) => {
        const data = res.data;
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = {
              total: data[key]?.total || 0,
              active: data[key]?.active || 0,
              inActive: data[key]?.inActive || 0,
              approved: data[key]?.approved || 0,
              pending: data[key]?.pending || 0,
              rejected: data[key]?.rejected || 0,
              deleted: data[key]?.deleted || 0
            };
          }
        }
        const members = data.member;
        members.total = Math.max(0, members.total - 1);
        members.active = Math.max(0, members.active - 1);
      })
    );
  }

  getArtefacts() {
    return this.http
      .get<APIResponseModel<Artefacts[]>>(`${API.DASHBOARD}/artefact`)
      .pipe(
        tap((res) => {
          res.data.forEach(
            (item) =>
              (item.url = item.url
                ? `${this.awsUrl}${item.url}`
                : '/assets/icons/no_image_placeholder.svg')
          );
        })
      );
  }
}
