/* eslint-disable no-console */
import { environment } from '@environment/environment';

export class LoggerService {
  static log(value: unknown, ...rest: unknown[]) {
    if (!environment.production) {
      console.log(value, ...rest);
    }
  }

  static error(error: unknown) {
    console.error(error);
  }

  static warn(value: unknown, ...rest: unknown[]) {
    if (!environment.production) {
      console.warn(value, ...rest);
    }
  }
}
