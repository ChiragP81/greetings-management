import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, catchError, map, tap } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import {
  AllHeadingList,
  HeadingDetail,
  HeadingList,
  HeadingListQueryParams
} from '@models/heading.model';
import { BaseApiService } from '@services/base-api.service';

export const HeadingData = (route: ActivatedRouteSnapshot) => {
  const categoryService = inject(HeadingService);
  const router = inject(Router);
  return categoryService.getById(route.params._id).pipe(
    tap(
      (res) =>
        (res.data.banner = { url: `${environment.awsUrl}${res.data.banner}` })
    ),
    catchError(() => {
      router.navigate(['/admin/headings/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class HeadingService extends BaseApiService<
  HeadingDetail,
  HeadingList,
  HeadingListQueryParams
> {
  private httpClient = inject(HttpClient);

  getEndpoint(): string {
    return API.HEADING;
  }

  getHeadingList(): Observable<OptionDetail[]> {
    return this.httpClient
      .get<APIResponseModel<AllHeadingList[]>>(`${this.getEndpoint()}/list`)
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return { label: element.headingName, value: element._id };
          });
        })
      );
  }
}
