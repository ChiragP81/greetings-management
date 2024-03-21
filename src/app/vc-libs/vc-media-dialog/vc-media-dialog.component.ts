import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MEDIA_TYPE } from '@constants/app.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FieldFormComponent } from '@pages/collections/artefact/add/field-form/field-form.component';
import { VcThreeDModelComponent } from '@vc-libs/vc-three-d-model/vc-three-d-model.component';

const components = [VcThreeDModelComponent, SvgIconComponent];
@Component({
  selector: 'app-vc-media-dialog',
  standalone: true,
  imports: [...components, TranslateModule],
  templateUrl: './vc-media-dialog.component.html'
})
export class VcMediaDialogComponent {
  mediaType = MEDIA_TYPE;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private dialogRef: MatDialogRef<FieldFormComponent>
  ) {}

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
