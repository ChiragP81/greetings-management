import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import {
  AllGalleryList,
  GalleryDetail,
  GalleryList,
  GalleryListQueryParams
} from '@models/gallery.model';
import { BaseApiService } from '@services/base-api.service';
import { Observable, catchError, map, tap } from 'rxjs';

export const GalleryData = (route: ActivatedRouteSnapshot) => {
  const galleryService = inject(GalleryService);
  const router = inject(Router);
  const awsUrl = environment.awsUrl;
  return galleryService.getById(route.params._id).pipe(
    tap((res) => {
      res.data.banner = { url: `${awsUrl}${res.data.banner}` };
      res.data.thumbnailImage = { url: `${awsUrl}${res.data.thumbnailImage}` };
      res.data.artefacts?.forEach((artefact) => {
        artefact.url = artefact.url
          ? `${awsUrl}${artefact.url}`
          : '/assets/icons/no_image_placeholder.svg';
      });
    }),
    catchError(() => {
      router.navigate(['/admin/gallery/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class GalleryService extends BaseApiService<
  GalleryDetail,
  GalleryList,
  GalleryListQueryParams
> {
  private httpClient = inject(HttpClient);

  getEndpoint(): string {
    return API.GALLERY;
  }

  getGalleryList(): Observable<OptionDetail[]> {
    return this.httpClient
      .get<APIResponseModel<AllGalleryList[]>>(`${this.getEndpoint()}/list`, {
        params: {
          isActive: true,
          isDeleted: false
        }
      })
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return { label: element.galleryName, value: element._id };
          });
        })
      );
  }
}
