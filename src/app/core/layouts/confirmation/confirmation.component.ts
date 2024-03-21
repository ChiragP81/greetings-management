import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { DialogData } from '@models/common.model';
import { DialogService } from '@services/dialog.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';

const components = [VcLoaderComponent, VcButtonComponent];

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [TranslateModule, ...components],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogService: DialogService
  ) {}

  get loaderStatus() {
    return this.dialogService.isLoading;
  }

  onConfirm() {
    this.dialogService.confirmUserDecision(true);
  }

  onCancel() {
    this.dialogService.confirmUserDecision(false);
  }
}
