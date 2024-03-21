import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';

import { APP } from '@constants/app.constants';
import { ConfirmationComponent } from '@layouts/confirmation/confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private static instance: DialogService | null = null;

  #subscription$ = new Subscription();
  #confirmDialogRef: MatDialogRef<ConfirmationComponent>;

  confirm$ = new Subject<boolean>();
  isLoading = false;

  constructor(private dialog: MatDialog) {
    DialogService.instance = this;
  }

  public static getInstance() {
    return DialogService.instance;
  }

  confirmUserDecision(confirm: boolean) {
    this.confirm$.next(confirm);
  }

  confirmDialog(name = 'dialog.areYouSureToDelete') {
    this.#confirmDialogRef = this.dialog.open(ConfirmationComponent, {
      width: APP.DIALOG_WIDTH,
      data: { name }
    });

    if (this.#subscription$) {
      this.#subscription$.unsubscribe();
    }

    return new Promise<boolean>((resolve) => {
      this.#subscription$ = this.confirm$.subscribe(resolve);
    });
  }

  closeConfirmDialog() {
    this.#confirmDialogRef.close();
  }
}
