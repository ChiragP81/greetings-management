import { isPlatformBrowser } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CryptoService } from '@services/crypto.service';

import { APP } from '@constants/app.constants';
import { STORAGE } from '@constants/storage.constant';
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  cacheAPIs = new Map<string, HttpResponse<unknown>>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<object>,
    @Inject('STORAGE') private storage: Storage,
    private cryptoService: CryptoService,
    private translateService: TranslateService
  ) {}

  get(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const encryptedValue = this.storage.getItem(key);
        return (
          encryptedValue &&
          JSON.parse(this.cryptoService.decryptValue(encryptedValue))
        );
      } catch {
        return null;
      }
    }
  }

  set(key: string, value: object | string) {
    if (isPlatformBrowser(this.platformId)) {
      const encryptedValue = this.cryptoService.encryptValue(
        JSON.stringify(value)
      );
      this.storage.setItem(key, encryptedValue);
    }
  }

  setLanguage() {
    const localStorageLanguage = this.get(
      STORAGE.CURRENT_LANGUAGE_STATE_KEY
    ) as string;
    const language = localStorageLanguage || APP.LANGUAGE;
    this.translateService.setDefaultLang(language);
    this.set(STORAGE.CURRENT_LANGUAGE_STATE_KEY, language);
  }

  changeLanguage(locale: string) {
    this.set(STORAGE.CURRENT_LANGUAGE_STATE_KEY, locale);
    this.translateService.use(locale);
  }

  getUserId() {
    return this.get(STORAGE.USER_DATA)._id;
  }

  remove(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage.removeItem(key);
    }
  }

  clear() {
    if (isPlatformBrowser(this.platformId)) {
      const currentLang: string = this.get(STORAGE.CURRENT_LANGUAGE_STATE_KEY);
      this.storage.clear();
      this.cacheAPIs.clear();
      if (currentLang) {
        this.set(STORAGE.CURRENT_LANGUAGE_STATE_KEY, currentLang);
      }
    }
  }
}
