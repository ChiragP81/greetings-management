import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling
} from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  HttpCacheInterceptor,
  HttpErrorInterceptor,
  HttpTokenInterceptor
} from '@interceptors/http.interceptor';
import { appRoutes } from '@routes/app.routes';
import { PageTitleStrategy } from '@services/page-title-strategy.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([
        HttpTokenInterceptor,
        HttpErrorInterceptor,
        HttpCacheInterceptor
      ])
    ),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      }),
      MatSnackBarModule,
      MatDialogModule,
      MatDatepickerModule,
      MatNativeDateModule
    ),
    { provide: 'STORAGE', useFactory: getStorage },
    { provide: TitleStrategy, useClass: PageTitleStrategy }
  ]
};

export function getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
