import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@constants/api.constants';

import { APP, MEDIA_EXTENSION, MEDIA_SIZE } from '@constants/app.constants';
import { TOASTER_TYPE } from '@constants/app.enums';
import {
  APIResponseModel,
  Media,
  MediaUrl,
  UploadMediaDetail
} from '@models/common.model';
import { ToasterService } from '@services/toaster.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  readonly imageType = APP.IMAGE_TYPE;

  constructor(
    private toasterService: ToasterService,
    private httpClient: HttpClient
  ) {}

  async handleImageFileInput(
    event: Event,
    size = MEDIA_SIZE.IMAGE
  ): Promise<Media> {
    return new Promise((resolve) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files) {
        for (const file of Array.from(files)) {
          if (!this.imageType.includes(file.type)) {
            this.toasterService.displayTranslation(
              'validation.invalidFileType',
              TOASTER_TYPE.ERROR,
              { extension: MEDIA_EXTENSION.IMAGE }
            );
            target.value = '';
            return;
          }

          if (file.size > size * APP.BYTES_PER_KB * APP.BYTES_PER_KB) {
            this.toasterService.displayTranslation(
              'validation.invalidFileSize',
              TOASTER_TYPE.ERROR,
              { size }
            );
            target.value = '';
            return;
          }

          const imageDetail: Media = { file, url: '' };
          const reader = new FileReader();
          reader.readAsDataURL(imageDetail.file);

          reader.onload = () => {
            imageDetail.url = reader.result as string;
            return resolve(imageDetail);
          };
        }
      }
    });
  }

  checkObjectIsEmpty(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
      return true;
    }
    return Object.keys(obj)
      .map((key) => {
        if (typeof obj[key] === 'string') {
          return obj[key] === '';
        } else if (obj[key] instanceof Date) {
          return isNaN(obj[key].getTime());
        } else if (typeof obj[key] === 'object' || Array.isArray(obj[key])) {
          return this.checkObjectIsEmpty(obj[key]);
        } else {
          return obj[key] === null || obj[key] === undefined;
        }
      })
      .reduce((prev, cur) => prev && cur, true);
  }

  removeNullBlankEmptyKeys<T>(obj: T): T {
    if (!obj || (typeof obj !== 'object' && !Array.isArray(obj))) {
      return obj;
    }

    if (Array.isArray(obj)) {
      const filteredArray = obj
        .map((item) => this.removeNullBlankEmptyKeys(item))
        .filter((item) => this.isValidArrayItem(item));
      return filteredArray as unknown as T;
    }

    const newObj = {} as T;
    for (const key in obj) {
      const value = this.removeNullBlankEmptyKeys(obj[key]);
      if (this.isValidValue(value)) {
        newObj[key] = value;
      }
    }

    return newObj;
  }

  isValidValue(value: unknown): boolean {
    return value != null && !this.isEmpty(value);
  }

  isValidArrayItem(item: unknown): boolean {
    return !this.isEmptyObject(item) && item != null;
  }

  isEmpty(value: unknown): boolean {
    return value === '' || value === undefined || value === null || value === 0;
  }

  isEmptyObject(obj: unknown): boolean {
    return typeof obj === 'object' && Object.keys(obj).length === 0;
  }

  toCamelCase(inputString: string): string {
    const words = inputString.split(/[\s_-]+/);
    const camelCaseWords = words.map((word, index) => {
      return index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return camelCaseWords.join('');
  }

  getPresignedUrl(id: string, mediaDetail) {
    return this.httpClient.get<APIResponseModel<MediaUrl>>(
      `${API.GENERATE_URL}/${id}`,
      { params: mediaDetail }
    );
  }

  createMediaDetail(id: string, url: string, file: File): UploadMediaDetail {
    return {
      id,
      url,
      file,
      name: file.name,
      mimeType: file.type,
      size: file.size
    };
  }

  modifyImageUrl(originalURL: string, type: string, suffix: string): string {
    const pattern = /thumbnail_watermark\/([^/]+)$/;
    const match = pattern.exec(originalURL);
    const currentImageName = match ? match[1] : '';
    const newImageName = currentImageName.replace(
      /\.([^.]+)$/,
      `-${suffix}.$1`
    );
    return originalURL.replace(pattern, `${type}/${newImageName}`);
  }

  getFileExtension(file: File): string {
    return file.name.split('.').pop().toLowerCase();
  }

  areObjectsSimilar<T>(currentObject: T, previousObject: T): boolean {
    if (currentObject === null || previousObject === null) {
      return currentObject === previousObject;
    }

    if (
      typeof currentObject !== 'object' ||
      typeof previousObject !== 'object'
    ) {
      return false;
    }

    const currentEntries = Object.entries(currentObject);
    const previousEntries = Object.entries(previousObject);

    if (currentEntries.length !== previousEntries.length) {
      return false;
    }

    for (const [key, currentValue] of currentEntries) {
      const previousValue = previousObject[key as keyof T];
      if (
        typeof currentValue === 'object' &&
        typeof previousValue === 'object'
      ) {
        if (!this.areObjectsSimilar(currentValue, previousValue)) {
          return false;
        }
      } else if (currentValue !== previousValue) {
        return false;
      }
    }

    return true;
  }

  getFileNameFromResponse(response: HttpResponse<unknown>) {
    let filename = '';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition) {
      filename = disposition.split('=')[1].trim();
    }
    return filename;
  }

  async downloadAsFile(response: HttpResponse<Blob>) {
    const blob = new Blob([response.body], {
      type: `${response.body?.type}`
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const fileName = this.getFileNameFromResponse(response);
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }
}
