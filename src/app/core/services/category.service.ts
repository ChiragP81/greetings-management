import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, catchError, map, tap } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import {
  AllCategoryList,
  CategoryDetail,
  CategoryList,
  CategoryListQueryParams
} from '@models/category.model';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import { BaseApiService } from '@services/base-api.service';

export const CategoryData = (route: ActivatedRouteSnapshot) => {
  const categoryService = inject(CategoryService);
  const router = inject(Router);
  return categoryService.getById(route.params._id).pipe(
    tap(
      (res) =>
        (res.data.banner = { url: `${environment.awsUrl}${res.data.banner}` })
    ),
    catchError(() => {
      router.navigate(['/admin/categories/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseApiService<
  CategoryDetail,
  CategoryList,
  CategoryListQueryParams
> {
  private httpClient = inject(HttpClient);

  getEndpoint(): string {
    return API.CATEGORY;
  }

  getCategoryList(): Observable<OptionDetail[]> {
    return this.httpClient
      .get<APIResponseModel<AllCategoryList[]>>(`${this.getEndpoint()}/list`)
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return { label: element.categoryName, value: element._id };
          });
        })
      );
  }
}
