import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, catchError, map, switchMap, tap } from 'rxjs';

import { API } from '@constants/api.constants';
import { ARTIST_STATUS } from '@constants/app.constants';
import {
  Artist,
  ArtistList,
  ArtistListQueryParams
} from '@models/artist.model';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import { BaseApiService } from '@services/base-api.service';

export const ArtistDetail = (route: ActivatedRouteSnapshot) => {
  const artistService = inject(ArtistService);
  const router = inject(Router);
  return artistService.getById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/artists/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class ArtistService extends BaseApiService<
  Artist,
  ArtistList,
  ArtistListQueryParams
> {
  private httpClient = inject(HttpClient);

  getEndpoint() {
    return API.ARTIST;
  }

  getNationalities() {
    return this.httpClient
      .get<APIResponseModel<{ nationality: string[]; }>>(API.NATIONALITIES)
      .pipe(
        map((res) =>
          res.data.nationality.map((nationality) => ({
            label: nationality,
            value: nationality
          }))
        )
      );
  }

  getArtists(params: Partial<ArtistListQueryParams>) {
    const httpParams = this.createHttpParamsFromPartial(params);
    return this.httpClient
      .get<APIResponseModel<ArtistList>>(this.getEndpoint(), {
        params: httpParams
      })
      .pipe(
        tap((res) => {
          res.data.list.forEach((element) => {
            element.name = `${element.salutation} ${element.firstName} ${element.lastName}`;
            element.status = element.isActive === ARTIST_STATUS.ACTIVE;
          });
        })
      );
  }

  createArtist(data: { data: Partial<Artist>; file: FormData; }) {
    return this.httpClient
      .post<APIResponseModel<Artist>>(`${this.getEndpoint()}`, data.data)
      .pipe(
        switchMap((res) => {
          return this.httpClient
            .put(res.data.signedUrl, data.file)
            .pipe(map(() => res));
        })
      );
  }

  updateArtist(_id: string, data: { data: Partial<Artist>; file: FormData; }) {
    return this.httpClient
      .put<APIResponseModel<Artist>>(`${this.getEndpoint()}/${_id}`, data.data)
      .pipe(
        switchMap((res) => {
          return this.httpClient
            .put(res.data.signedUrl, data.file)
            .pipe(map(() => res));
        })
      );
  }

  getArtistList(): Observable<OptionDetail[]> {
    return this.httpClient
      .get<
        APIResponseModel<
          Pick<Artist, '_id' | 'firstName' | 'lastName' | 'salutation'>[]
        >
      >(`${this.getEndpoint()}/list`)
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return {
              label: `${element.salutation} ${element.firstName} ${element.lastName}`,
              value: element._id
            };
          });
        })
      );
  }
}
