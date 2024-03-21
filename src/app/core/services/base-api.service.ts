import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResponseModel } from '@models/common.model';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService<T, U, V> {
  constructor(protected http: HttpClient) {}

  abstract getEndpoint(): string;

  get(params?: Partial<V>) {
    const httpParams = this.createHttpParamsFromPartial(params);
    return this.http.get<APIResponseModel<U>>(this.getEndpoint(), {
      params: httpParams
    });
  }

  getById(_id: string) {
    return this.http.get<APIResponseModel<T>>(`${this.getEndpoint()}/${_id}`);
  }

  create(data: Partial<T>) {
    return this.http.post<APIResponseModel<T>>(`${this.getEndpoint()}`, data);
  }

  update(_id: string, data: Partial<T>) {
    return this.http.put<APIResponseModel<T>>(
      `${this.getEndpoint()}/${_id}`,
      data
    );
  }

  delete(_id: string) {
    return this.http.delete<APIResponseModel<object>>(
      `${this.getEndpoint()}/${_id}`
    );
  }

  createHttpParamsFromPartial(partial): HttpParams {
    let httpParams = new HttpParams();
    const traverseParams = (params) => {
      for (const key in params) {
        if (typeof params[key] === 'object') {
          return traverseParams(params[key]);
        }
        if (Object.hasOwn(params, key)) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      }
    };
    traverseParams(partial);
    return httpParams;
  }
}
