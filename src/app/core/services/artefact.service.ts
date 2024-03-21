import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, tap } from 'rxjs';

import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import {
  AllArtefactList,
  Artefact,
  ArtefactDetail,
  ArtefactList,
  ArtefactListQueryParams,
  ArtefactMetaData,
  MediaList,
  RejectedLogList
} from '@models/artefact.model';
import { APIResponseModel, MediaUrl } from '@models/common.model';
import { BaseApiService } from '@services/base-api.service';
import { UtilityService } from '@services/utility.service';

export const ArtefactData = (route: ActivatedRouteSnapshot) => {
  const artefactService = inject(ArtefactService);
  const router = inject(Router);
  return artefactService.getArtefactById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/artefact/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class ArtefactService extends BaseApiService<
  Artefact,
  ArtefactList,
  ArtefactListQueryParams
> {
  private httpClient = inject(HttpClient);
  private utilityService = inject(UtilityService);
  artefactId: string;
  readonly awsUrl = environment.awsUrl;
  previousArtefactDetail: ArtefactDetail;

  getEndpoint(): string {
    return API.ARTEFACT;
  }

  getArtefacts(params: Partial<ArtefactListQueryParams>) {
    const httpParams = this.createHttpParamsFromPartial(params);
    return this.httpClient
      .get<APIResponseModel<ArtefactList>>(this.getEndpoint(), {
        params: httpParams
      })
      .pipe(
        tap((res) => {
          res.data.list.forEach((el) => {
            el.url = el.url
              ? `${this.awsUrl}${el.url}`
              : '/assets/icons/no_image_placeholder.svg';
            el.listUrl = el.url
              ? this.utilityService.modifyImageUrl(el.url, 'list', 'starter')
              : el.url;
            el.artistName = el.artistName || '-';
            el.categoryName = el.categoryName || '-';
          });
        })
      );
  }

  saveMetaData(id: string, payload: ArtefactMetaData) {
    return this.httpClient.put<APIResponseModel<Artefact>>(
      `${this.getEndpoint()}/metadata/${id}`,
      payload
    );
  }

  getUploadMediaUrl(id: string, mediaDetail) {
    return this.httpClient.get<APIResponseModel<MediaUrl>>(
      `${this.getEndpoint()}/generate-url/${id}`,
      { params: mediaDetail }
    );
  }

  getMediaList(id: string, tabName: string) {
    const params = { tabName };
    return this.httpClient
      .get<APIResponseModel<MediaList[]>>(`${API.UPLOAD_URL}/${id}`, { params })
      .pipe(
        tap((res) => {
          res.data.forEach((media) => {
            media.url = `${this.awsUrl}${media.url}`;
            if (media.coverUrl) {
              media.coverUrl = `${this.awsUrl}${media.coverUrl}`;
            }
          });
        })
      );
  }

  updateArtefactMedia(id: string, payload: { field: string; value: boolean }) {
    return this.httpClient.put<APIResponseModel<null>>(
      `${API.UPLOAD_URL}/${id}`,
      payload
    );
  }

  updateArtefactStatus(id: string, status: string, message?: string) {
    return this.httpClient.put<APIResponseModel<null>>(
      `${this.getEndpoint()}/status/${id}`,
      { status, message }
    );
  }

  updateArtefactActive(id: string, isActive?: boolean) {
    return this.httpClient.put<APIResponseModel<null>>(
      `${this.getEndpoint()}/active/${id}`,
      { isActive }
    );
  }

  getArtefactList() {
    return this.httpClient
      .get<APIResponseModel<AllArtefactList[]>>(`${this.getEndpoint()}/list`, {
        params: {
          status: 'approved'
        }
      })
      .pipe(
        tap((res) => {
          res.data.forEach((el) => {
            el.url = el.url
              ? `${this.awsUrl}${el.url}`
              : '/assets/icons/no_image_placeholder.svg';
          });
        })
      );
  }

  archiveArtefact(_id: string, body: { archive: boolean }) {
    return this.http.delete<APIResponseModel<object>>(
      `${this.getEndpoint()}/${_id}`,
      { body }
    );
  }

  getRejectedLogs(params?: Partial<ArtefactListQueryParams>) {
    const httpParams = this.createHttpParamsFromPartial(params);
    return this.http.get<APIResponseModel<RejectedLogList>>(
      `${this.getEndpoint()}/rejected-log`,
      { params: httpParams }
    );
  }

  updateMediaOrder(id: string, payload: { mediaId: string; index: number }[]) {
    return this.http.put<APIResponseModel<null>>(
      `${this.getEndpoint()}/update-index/${id}`,
      { uploadMedia: payload }
    );
  }

  updateAccessionNumber(id: string, payload: { accessionNo: string }) {
    return this.http.put<APIResponseModel<null>>(
      `${this.getEndpoint()}/accession-number/${id}`,
      payload
    );
  }

  getArtefactById(id: string) {
    return this.http
      .get<APIResponseModel<ArtefactDetail>>(`${this.getEndpoint()}/${id}`)
      .pipe(
        tap(
          (res) =>
            (res.data.url = res.data.url
              ? `${environment.awsUrl}${res.data.url}`
              : '/assets/icons/no_image_placeholder.svg')
        )
      );
  }

  export(params: Partial<ArtefactListQueryParams>) {
    return this.httpClient
      .get(`${this.getEndpoint()}/export`, {
        observe: 'response' as const,
        responseType: 'blob' as const,
        params: params as HttpParams
      })
      .pipe(
        tap((response: HttpResponse<Blob>) =>
          this.utilityService.downloadAsFile(response)
        )
      );
  }
}
