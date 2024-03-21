import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { NgClass, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { LABEL_TYPE } from '@constants/app.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabFormService } from '@services/tab-form.service';
import { UtilityService } from '@services/utility.service';
import { DynamicField, FIELD_TYPE } from '@vc-libs/types';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';

const modules = [
  ReactiveFormsModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  TranslateModule,
  NgxEditorModule,
  NgSelectModule,
  MatRadioModule,
  MatCheckboxModule
];
const components = [
  VcInputComponent,
  SvgIconComponent,
  VcButtonComponent,
  VcLoaderComponent
];

@Component({
  selector: 'app-vc-dynamic-form',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    NgSwitchCase,
    ...modules,
    ...components,
    CdkDrag,
    CdkDropList,
    CdkDragPlaceholder
  ],
  templateUrl: './vc-dynamic-form.component.html'
})
export class VcDynamicFormComponent implements OnInit {
  _fields: DynamicField[] = [];
  @Input() isMetaData = false;
  @Input() set fields(value: DynamicField[]) {
    value.forEach((field) => {
      if (this.isMetaData && field.labelType === LABEL_TYPE.METADATA) {
        field.name = field._id;
      }
    });
    this._fields = value;
  }
  @Input() formGroup: FormGroup;
  @Input() cssClass: Record<string, boolean>;
  @Input() fromMetadata = false;
  @Input() showAction = false;
  @Input() isCheckbox = false;
  @Input() cdkDragDisabled = true;
  @Input() isLoading: boolean;

  @Output() deleteField = new EventEmitter<number>();
  @Output() editField = new EventEmitter<number>();

  editor = new Map<string, Editor>();
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];
  today = new Date();

  readonly fieldType = FIELD_TYPE;
  readonly labelType = LABEL_TYPE;

  constructor(
    private utilityService: UtilityService,
    private tabFormService: TabFormService
  ) {}

  ngOnInit() {
    this._fields.forEach((field) => {
      if (field.type === FIELD_TYPE.Editor) {
        this.editor.set(field.name, new Editor());
      }
    });
  }

  removeField(index: number) {
    if (this.fromMetadata) {
      this.deleteField.emit(index);
    } else {
      const fieldName = this._fields[index].name;
      this.formGroup.removeControl(fieldName);
      this.formGroup.removeControl(fieldName + '-type');
      this._fields.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<DynamicField[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  async onFileChange(event: Event, controlName: string) {
    const fileDetail = await this.utilityService.handleImageFileInput(event);
    this.formGroup.get(controlName).setValue(fileDetail);
  }

  onDateChange(
    event: MatDatepickerInputEvent<Date>,
    control: AbstractControl
  ): void {
    event.value && control.patchValue(event.value?.toISOString());
  }

  onCheckboxChange(event: MatCheckboxChange, field: DynamicField) {
    const checkboxValue = event.checked;
    const controlName = this.formGroup.get(field.name) as FormControl;

    if (checkboxValue) {
      field.checked = true;
      this.tabFormService.addRequiredValidator(controlName);
    } else {
      field.checked = false;
      this.tabFormService.removeRequiredValidator(controlName);
    }
  }
}
