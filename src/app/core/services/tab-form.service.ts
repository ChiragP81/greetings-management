import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { APP, MEDIA_EXTENSION } from '@constants/app.constants';
import { ARTEFACT_TABS, MEDIA_TYPE, TOASTER_TYPE } from '@constants/app.enums';
import { ArtefactFormField, ArtefactTab } from '@models/artefact.model';
import { AddTabField, DynamicField, FIELD_TYPE } from '@vc-libs/types';
import { ToasterService } from './toaster.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class TabFormService {
  tabs: ArtefactTab[] = [];
  tabFormGroups: FormGroup[] = [];
  tabFormFieldsGroup: FormGroup<ArtefactFormField>[] = [];
  currentTabIndex = ARTEFACT_TABS.GENERAL;
  tabIndexChange$ = new BehaviorSubject(ARTEFACT_TABS.GENERAL);

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: InjectionToken<object>,
    private toasterService: ToasterService,
    private utilityService: UtilityService
  ) {}

  init() {
    this.tabs = [];
    this.tabFormGroups = [];
    this.tabFormFieldsGroup = [];
  }

  prepareGeneralTab() {
    this.addTab(this.translateService.instant('artefact.general'));
    const tabFormGroup = this.tabFormGroups[ARTEFACT_TABS.GENERAL];
    tabFormGroup.addControl(
      'title',
      new FormControl('', [Validators.required])
    );
    tabFormGroup.addControl(
      'accessionNo',
      new FormControl('', [Validators.required])
    );
    tabFormGroup.addControl('credit', new FormControl(''));
    tabFormGroup.addControl('artistId', new FormControl(''));
    tabFormGroup.addControl('placeOfOrigin', new FormControl(''));
    tabFormGroup.addControl('originYear', new FormControl(''));
    tabFormGroup.addControl(
      'categoryId',
      new FormControl('', [Validators.required])
    );
    tabFormGroup.addControl('dimensions', new FormControl(''));
    tabFormGroup.addControl('medium', new FormControl(''));
    tabFormGroup.addControl('headingId', new FormControl([]));
    tabFormGroup.addControl('description', new FormControl(''));
    tabFormGroup.addControl('keyword', new FormControl([]));
    tabFormGroup.addControl(
      'auctionHistory',
      this.createEmptyFormArray(this.auctionHistoryFormGroup())
    );
    tabFormGroup.addControl(
      'insuranceHistory',
      this.createEmptyFormArray(this.insuranceHistoryFormGroup())
    );
    tabFormGroup.addControl('previewFields', this.predefinedPreviewFields());
  }

  prepareMediaTab() {
    this.addTab(this.translateService.instant('artefact.media'));
  }

  prepareVideoTab(): void {
    this.addTab(this.translateService.instant('artefact.videos'));
  }

  prepareImageTab(): void {
    this.addTab(this.translateService.instant('artefact.photos'));
  }

  prepareDocumentTab(): void {
    this.addTab(this.translateService.instant('artefact.documents'));
  }

  prepareAudioTab(): void {
    this.addTab(this.translateService.instant('artefact.audios'));
  }

  prepareMetaDataTab(): void {
    this.addTab(this.translateService.instant('artefact.metadata'));
  }

  addTab(label = this.translateService.instant('artefact.newTab')) {
    this.tabs.push({ label, fields: [] });
    this.tabFormGroups.push(this.createEmptyTabFormGroup());
    this.tabFormFieldsGroup.push(this.createEmptyTabFormFieldsGroup());
  }

  addField(params: AddTabField) {
    if (
      [FIELD_TYPE.Select, FIELD_TYPE.Radio].includes(
        params.fieldType as FIELD_TYPE
      )
    ) {
      const values = params.options.split(',');
      params.optionDetail = values.map((value) => ({
        label: value.trim(),
        value: value.trim()
      }));
    }

    this.tabs[params.tabIndex].fields.push({
      name: params.fieldName,
      type: params.fieldType,
      label: params.fieldTitle,
      options: params.options,
      characterLimit: params.characterLimit,
      sequence: params.sequence,
      mandatory: params.mandatory,
      isVisible: params.isVisible,
      optionDetail: params.optionDetail
    });

    this.tabFormGroups[params.tabIndex].addControl(
      params.fieldName,
      new FormControl(
        null,
        params.canValidate ? this.addDynamicValidation(params) : null
      )
    );
    this.tabFormGroups[params.tabIndex].addControl(
      params.fieldName + '-type',
      new FormControl(params.fieldType)
    );
  }

  selectTab(index: number) {
    this.tabIndexChange$.next(index);
  }

  getTabData(tabIndex: number) {
    return this.tabFormGroups[tabIndex].value;
  }

  removeTab(tabIndex: number) {
    this.tabFormFieldsGroup.splice(tabIndex, 1);
    this.tabFormGroups.splice(tabIndex, 1);
    this.tabs.splice(tabIndex, 1);
  }

  updateTabLabel(event: Event, tabIndex: number) {
    this.tabs[tabIndex].label = (event.target as HTMLElement).innerHTML;
  }

  createEmptyTabFormGroup(): FormGroup {
    return this.formBuilder.group({});
  }

  predefinedPreviewFields() {
    return this.formBuilder.group({
      credit: [false],
      artistId: [false],
      placeOfOrigin: [false],
      originYear: [false],
      categoryId: [false],
      dimensions: [false],
      medium: [false],
      headingId: [false],
      description: [false],
      keyword: [false],
      auctionHistory: [false],
      insuranceHistory: [false]
    });
  }

  createEmptyFormArray(formGroup?: FormGroup): FormArray {
    return this.formBuilder.array([formGroup]);
  }

  auctionHistoryFormGroup() {
    return this.formBuilder.group({
      auctionHouse: [null],
      location: [null],
      notes: [null],
      dateOfPurchase: [null],
      currency: [null],
      purchasePrice: [null],
      tax: [null],
      transportCost: [null],
      totalCost: [null]
    });
  }

  insuranceHistoryFormGroup() {
    return this.formBuilder.group({
      insurance: [null],
      value: [null],
      notes: [null],
      currency: [null],
      date: [null],
      valuedBy: [null]
    });
  }

  createEmptyTabFormFieldsGroup() {
    return this.formBuilder.group({
      label: ['', Validators.required],
      inputType: ['text'],
      isRequired: [true],
      isVisible: [true],
      characterLimit: [null, Validators.required],
      sequence: [null, Validators.required],
      options: ['']
    }) as FormGroup<ArtefactFormField>;
  }

  addDynamicValidation(field: DynamicField | AddTabField): ValidatorFn[] {
    const validations: ValidatorFn[] = [];
    field.mandatory && validations.push(Validators.required);
    field.characterLimit &&
      validations.push(Validators.maxLength(field.characterLimit));
    return validations;
  }

  isPlatformIsBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  checkValidation(file: File, type: MEDIA_TYPE): boolean {
    const mediaTypeToValidation = {
      [MEDIA_TYPE.IMAGE]: {
        type: APP.IMAGE_TYPE,
        maxSize: APP.MAX_IMAGE_SIZE,
        extension: MEDIA_EXTENSION.IMAGE
      },
      [MEDIA_TYPE.VIDEO]: {
        type: APP.VIDEO_TYPE,
        maxSize: APP.MAX_VIDEO_SIZE,
        extension: MEDIA_EXTENSION.VIDEO
      },
      [MEDIA_TYPE.DOCUMENT]: {
        type: APP.DOCUMENT_TYPE,
        maxSize: APP.MAX_DOCUMENT_SIZE,
        extension: MEDIA_EXTENSION.DOCUMENT
      },
      [MEDIA_TYPE.AUDIO]: {
        type: APP.AUDIO_TYPE,
        maxSize: APP.MAX_AUDIO_SIZE,
        extension: MEDIA_EXTENSION.AUDIO
      },
      [MEDIA_TYPE['3D']]: {
        type: APP['3D_TYPE'],
        maxSize: APP.MAX_3D_SIZE,
        extension: MEDIA_EXTENSION['3D']
      }
    };

    const validationInfo = mediaTypeToValidation[type];
    const fileExtension = this.utilityService.getFileExtension(file);
    if (
      (file.type && !validationInfo.type.includes(file.type)) ||
      (!file.type && !validationInfo.extension.includes(fileExtension))
    ) {
      this.toasterService.displayTranslation(
        'validation.invalidFileType',
        TOASTER_TYPE.ERROR,
        { extension: validationInfo.extension }
      );
      return false;
    }

    if (file.size > validationInfo.maxSize) {
      this.toasterService.displayTranslation(
        'validation.invalidFileSize',
        TOASTER_TYPE.ERROR,
        { size: validationInfo.maxSize / APP.BYTES_PER_KB / APP.BYTES_PER_KB }
      );
      return false;
    }
    return true;
  }

  addRequiredValidator(control: FormControl) {
    control.setValidators([Validators.required]);
    control.updateValueAndValidity();
  }

  removeRequiredValidator(control: FormControl) {
    control.clearValidators();
    control.updateValueAndValidity();
  }

  addRequiredValidatorsToFormArray(formArray: FormArray) {
    const group = formArray.at(0) as FormGroup;

    for (const controlName in group.controls) {
      if (Object.prototype.hasOwnProperty.call(group.controls, controlName)) {
        const control = group.get(controlName) as FormControl;
        this.addRequiredValidator(control);
      }
    }
  }

  removeRequiredValidatorsFromFormArray(formArray: FormArray) {
    const group = formArray.at(0) as FormGroup;

    for (const controlName in group.controls) {
      if (Object.prototype.hasOwnProperty.call(group.controls, controlName)) {
        const control = group.get(controlName) as FormControl;
        this.removeRequiredValidator(control);
      }
    }
  }
}
