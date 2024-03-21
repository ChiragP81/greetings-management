import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { API } from '@constants/api.constants';
import { FIELD_VALUE, LABEL_TYPE, METADATA_TABS } from '@constants/app.enums';
import {
  APIResponseModel,
  ExportModel,
  OptionDetail
} from '@models/common.model';
import {
  Metadata,
  MetadataForm,
  MetadataList,
  MetadataListQueryParams
} from '@models/metadata.model';
import { BaseApiService } from '@services/base-api.service';
import { UtilityService } from '@services/utility.service';
import { DynamicField, FIELD_TYPE } from '@vc-libs/types';

export const MetadataDetail = (route: ActivatedRouteSnapshot) => {
  const metadataTypeService = inject(MetadataService);
  const router = inject(Router);
  return metadataTypeService.getById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/metadata/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class MetadataService extends BaseApiService<
  Metadata,
  MetadataList,
  MetadataListQueryParams
> {
  private httpClient = inject(HttpClient);
  private utilityService = inject(UtilityService);

  getEndpoint() {
    return API.METADATA;
  }

  getMetadataForm(tabName: METADATA_TABS, labelType?: LABEL_TYPE) {
    return this.httpClient
      .get<APIResponseModel<MetadataForm[]>>(
        `${this.getEndpoint()}/${tabName}`,
        {
          params: {
            field: FIELD_VALUE.METADATA_FORM,
            ...(labelType && { labelType })
          }
        }
      )
      .pipe(
        map((res) =>
          res.data.map((data) => {
            const optionDetail: OptionDetail[] = [
              FIELD_TYPE.Select,
              FIELD_TYPE.Radio
            ].includes(data.inputType as FIELD_TYPE)
              ? (data.values as string[])?.map((value) => ({
                  label: value.trim(),
                  value: value.trim()
                }))
              : [];
            return {
              _id: data._id,
              name: data.label,
              type: data.inputType,
              label: data.displayLabel || data.label,
              characterLimit: data.characterLimit,
              mandatory: data.isRequired,
              isVisible: data.isVisible,
              optionDetail,
              values: data.values,
              sequence: data.sequence,
              labelType: data.labelType,
              checked: false
            } as DynamicField;
          })
        )
      );
  }

  updateMetadataField(id: string, payload: Partial<MetadataForm>) {
    return this.httpClient.put<APIResponseModel<MetadataForm>>(
      `${this.getEndpoint()}/${id}`,
      payload
    );
  }

  addMetadataField(payload: Partial<MetadataForm>) {
    return this.httpClient.post<APIResponseModel<MetadataForm>>(
      this.getEndpoint(),
      payload
    );
  }

  getPlaceAfterDetail(tabName: METADATA_TABS) {
    return this.httpClient.get<
      APIResponseModel<Pick<MetadataForm, 'displayLabel' | '_id'>[]>
    >(`${this.getEndpoint()}/${tabName}`, {
      params: {
        field: FIELD_VALUE.ADD_FIELD,
        ...(tabName === METADATA_TABS.ARTEFACT && {
          labelType: LABEL_TYPE.METADATA
        })
      }
    });
  }

  import(data: FormData) {
    return this.httpClient.post<APIResponseModel<ExportModel>>(
      `${this.getEndpoint()}/import`,
      data
    );
  }

  export(formType: string) {
    const options = {
      observe: 'response' as const,
      responseType: 'blob' as const
    };
    return this.httpClient
      .get(`${this.getEndpoint()}/export?formType=${formType}`, options)
      .pipe(
        tap((response: HttpResponse<Blob>) =>
          this.utilityService.downloadAsFile(response)
        )
      );
  }
}
