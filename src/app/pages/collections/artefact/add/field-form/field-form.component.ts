import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { YES_NO_OPTIONS } from '@constants/app.constants';
import { LABEL_TYPE, REGEX_TYPE } from '@constants/app.enums';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';
import { FieldTabDetail } from '@models/common.model';
import { MetadataForm } from '@models/metadata.model';
import { MetadataService } from '@services/metadata.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { FIELD_TYPE } from '@vc-libs/types';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [VcInputComponent, VcButtonComponent];
const directives = [AllowNumberOnlyDirective];

@Component({
  selector: 'app-field-form',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    ...modules,
    ...components,
    ...directives
  ],
  templateUrl: './field-form.component.html'
})
export class FieldFormComponent implements OnInit {
  showOptionsField = false;
  showCharacterLimitField = true;
  fieldDetail: Pick<MetadataForm, 'displayLabel' | '_id'>[] = [];
  isLoading = false;

  readonly availableFieldTypes = Object.keys(FIELD_TYPE).map((key) => ({
    label: key,
    value: FIELD_TYPE[key as keyof typeof FIELD_TYPE]
  }));
  readonly yesNoOptions = YES_NO_OPTIONS;
  readonly regexType = REGEX_TYPE;
  #destroyRef = inject(DestroyRef);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FieldTabDetail,
    private dialogRef: MatDialogRef<FieldFormComponent>,
    private metadataService: MetadataService,
    private utilityService: UtilityService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.getFieldDetail();
    if (this.data.fieldDetail) {
      const data = this.data.fieldDetail;
      this.data.tabFormFieldsGroup.patchValue(data);
      this.data.tabFormFieldsGroup.controls.isRequired.setValue(data.mandatory);
      this.data.tabFormFieldsGroup.controls.inputType.setValue(data.type);
      this.onChange(data.type as FIELD_TYPE);
    }
  }

  getFieldDetail() {
    this.metadataService
      .getPlaceAfterDetail(this.data.tabName)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.fieldDetail = res.data.filter(
          (value) => this.data.fieldDetail?.label !== value.displayLabel
        );
      });
  }

  save() {
    this.data.tabFormFieldsGroup.markAllAsTouched();
    if (this.data.tabFormFieldsGroup.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.data.fieldDetail) {
      this.updateField();
    } else {
      this.addField();
    }
  }

  onChange(value: FIELD_TYPE): void {
    this.data.tabFormFieldsGroup.controls.characterLimit.clearValidators();
    this.data.tabFormFieldsGroup.controls.options.clearValidators();
    this.showCharacterLimitField = false;
    this.showOptionsField = false;

    if ([FIELD_TYPE.Select, FIELD_TYPE.Radio].includes(value)) {
      this.data.tabFormFieldsGroup.controls.options.setValidators(
        Validators.required
      );
      this.showOptionsField = true;
    } else if ([FIELD_TYPE.Text, FIELD_TYPE.TextArea].includes(value)) {
      this.data.tabFormFieldsGroup.controls.characterLimit.setValidators([
        Validators.required
      ]);
      this.showCharacterLimitField = true;
    }

    this.data.tabFormFieldsGroup.controls.characterLimit.updateValueAndValidity();
    this.data.tabFormFieldsGroup.controls.options.updateValueAndValidity();
  }

  getPayload() {
    const data = this.utilityService.removeNullBlankEmptyKeys(
      this.data.tabFormFieldsGroup.value
    );
    let values: string;
    if (
      [FIELD_TYPE.Select, FIELD_TYPE.Radio].includes(
        data.inputType as FIELD_TYPE
      )
    ) {
      values = data.options;
    }
    const displayLabel = data.label;
    const labelType = this.data.fieldDetail?.labelType || LABEL_TYPE.METADATA;
    data.label = this.utilityService.toCamelCase(data.label);
    this.data.fieldDetail && delete data.label;
    delete data.options;
    return {
      ...data,
      formType: this.data.tabName,
      ...(values && { values }),
      displayLabel,
      labelType
    };
  }

  updateField() {
    this.metadataService
      .updateMetadataField(this.data.fieldDetail._id, this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.closeDialog(true);
      });
  }

  addField() {
    this.metadataService
      .addMetadataField(this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.closeDialog(true);
      });
  }

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }
}
