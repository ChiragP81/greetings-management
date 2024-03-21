import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { CACHE_API } from '@constants/api.constants';
import { TOASTER_TYPE } from '@constants/app.enums';
import { STORAGE } from '@constants/storage.constant';
import { LoggerService } from '@services/logger.service';
import { StorageService } from '@services/storage.service';
import { ToasterService } from '@services/toaster.service';

export const HttpTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const storageService = inject(StorageService);
  const token = storageService.get(STORAGE.LOGIN_TOKEN);

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Timezone-Offset': String(new Date().getTimezoneOffset())
      }
    });
  }

  return next(request);
};

export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const toasterService = inject(ToasterService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // if (
      //   error.status === HttpStatusCode.Unauthorized &&
      //   router.url !== ROUTES.LOGIN
      // ) {
      //   router.navigate(['/auth/logout']);
      // }
      if (error.error?.message) {
        toasterService.display(error.error.message, TOASTER_TYPE.ERROR);
      }
      const err = new HttpErrorResponse({
        error: error.error,
        statusText: error.message,
        status: error.status
      });
      LoggerService.error(err);
      throw err;
    })
  );
};

export const HttpCacheInterceptor: HttpInterceptorFn = (request, next) => {
  const storageService = inject(StorageService);
  const shouldCache = (request: HttpRequest<unknown>) => {
    return (
      request.method === 'GET' &&
      CACHE_API.findIndex((api) => request.url.startsWith(api)) !== -1
    );
  };

  if (shouldCache(request)) {
    const cachedResponse = storageService.cacheAPIs.get(request.url);
    if (cachedResponse) {
      return of(cachedResponse.clone());
    }
  }

  return next(request).pipe(
    tap((response) => {
      if (shouldCache(request) && response instanceof HttpResponse) {
        storageService.cacheAPIs.set(request.url, response.clone());
      }
    })
  );
};
