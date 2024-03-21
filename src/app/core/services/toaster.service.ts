import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { Params } from '@angular/router';
import { TOASTER_TYPE } from '@constants/app.enums';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  showLoader$ = new Subject<boolean>();

  constructor(
    private matSnackbar: MatSnackBar,
    public translateService: TranslateService
  ) {}

  displayLoader() {
    this.showLoader$.next(true);
  }

  hideLoader() {
    this.showLoader$.next(false);
  }

  display(message: string, type: TOASTER_TYPE = TOASTER_TYPE.SUCCESS) {
    if (message) {
      this.matSnackbar.open(message, 'X', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: [type + '-snackbar']
      });
    }
  }

  displayTranslation(
    message: string,
    type: TOASTER_TYPE = TOASTER_TYPE.SUCCESS,
    dynamicValue?: Params
  ) {
    const translateMessage = this.translateService.instant(
      message,
      dynamicValue
    );
    if (translateMessage) {
      this.matSnackbar.open(translateMessage, 'X', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: [type + '-snackbar']
      });
    }
  }
}
