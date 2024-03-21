import { HttpBackend, HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@constants/api.constants';
import { TOTAL_PERCENT } from '@constants/app.constants';
import { ARTEFACT_TABS } from '@constants/app.enums';
import { APIResponseModel, UploadMediaDetail } from '@models/common.model';
import { Observable, Subject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaUploadService {
  mediaDetail: UploadMediaDetail[] = [];
  mediaDetail$ = new Subject<UploadMediaDetail[]>();
  mediaUploaded$ = new Subject<ARTEFACT_TABS>();
  httpWithoutInterceptor: HttpClient;

  constructor(
    private httpClient: HttpClient,
    private httpBackend: HttpBackend
  ) {
    this.httpWithoutInterceptor = new HttpClient(this.httpBackend);
  }

  uploadMedia(data: UploadMediaDetail): Observable<number | boolean> {
    return this.httpWithoutInterceptor
      .put(data.url, data.file, {
        headers: { 'Content-Type': data.mimeType },
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round(
              (TOTAL_PERCENT * event.loaded) / event.total
            );
            return progress;
          }
          return event.type === HttpEventType.Response ? true : 0;
        })
      );
  }

  deleteMedia(id: string) {
    return this.httpClient.delete<APIResponseModel<null>>(
      `${API.UPLOAD_URL}/${id}`
    );
  }
}
