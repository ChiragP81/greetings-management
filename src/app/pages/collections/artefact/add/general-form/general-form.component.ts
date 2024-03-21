import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { ActivatedRoute } from '@angular/router';
import { HISTORY, POSITION, REGEX_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ArtefactDetail } from '@models/artefact.model';
import { OptionDetail } from '@models/common.model';
// import { AddComponent as CreateArtist } from '@pages/collections/artists/add/add.component';
import { ArtefactService } from '@services/artefact.service';
import { ArtistService } from '@services/artist.service';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { CategoryService } from '@services/category.service';
import { DialogService } from '@services/dialog.service';
import { HeadingService } from '@services/heading.service';
import { TabFormService } from '@services/tab-form.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';
import { finalize } from 'rxjs';

const modules = [
  ReactiveFormsModule,
  MatDatepickerModule,
  NgSelectModule,
  TranslateModule,
  MatCheckboxModule
];
const components = [
  VcInputComponent,
  SvgIconComponent,
  VcButtonComponent,
  // CreateArtist,
  VcLoaderComponent
];

@Component({
  selector: 'app-general-form',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './general-form.component.html'
})
export class GeneralFormComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() id: string;

  artistList: OptionDetail[] = [];
  categoryList: OptionDetail[] = [];
  headingList: OptionDetail[] = [];
  artefactDetail: ArtefactDetail;
  isLoading = false;

  #destroyRef = inject(DestroyRef);

  readonly position = POSITION;
  readonly regexType = REGEX_TYPE;
  readonly history = HISTORY;

  constructor(
    private dialog: MatDialog,
    private artistService: ArtistService,
    private tabFormService: TabFormService,
    private dialogService: DialogService,
    private categoryService: CategoryService,
    private headingService: HeadingService,
    private artefactService: ArtefactService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute
  ) { }

  get auctionHistoryArray() {
    return this.formGroup.controls.auctionHistory as FormArray;
  }

  get insuranceHistoryArray() {
    return this.formGroup.controls.insuranceHistory as FormArray;
  }

  get previewFields() {
    return this.formGroup.controls.previewFields as FormGroup;
  }

  getFormControl(auction: AbstractControl): FormControl {
    return auction as FormControl;
  }

  ngOnInit() {
    this.getCategoryList();
    this.getArtistList();
    this.getHeadingList();
    this.id && this.getArtefactDetail();
  }

  getCategoryList() {
    this.categoryService
      .getCategoryList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => (this.categoryList = res));
  }

  getArtistList() {
    this.artistService
      .getArtistList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => (this.artistList = res));
  }

  getHeadingList() {
    this.headingService
      .getHeadingList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => (this.headingList = res));
  }

  getArtefactDetail() {
    this.isLoading = true;
    this.artefactService
      .getArtefactById(this.id)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.artefactDetail = res.data;
        this.emitBreadcrumbDetail();
        this.patchArtefactDetail();
      });
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.artefactDetail.title
    });
  }

  patchArtefactDetail() {
    for (let i = 0; i < this.artefactDetail.auctionHistory?.length - 1; i++) {
      const formGroup = this.tabFormService.auctionHistoryFormGroup();
      this.auctionHistoryArray.push(formGroup);
    }
    for (let i = 0; i < this.artefactDetail.insuranceHistory?.length - 1; i++) {
      const formGroup = this.tabFormService.insuranceHistoryFormGroup();
      this.insuranceHistoryArray.push(formGroup);
    }
    if ('predefined' in this.artefactDetail.previewFields) {
      this.artefactDetail.previewFields.predefined?.forEach((key) => {
        const control = this.formGroup.controls.previewFields.get(key);
        if (control) {
          control.setValue(true);
          const formControl = this.formGroup.controls[key] as FormControl;
          this.tabFormService.addRequiredValidator(formControl);
        }
      });
    }
    this.formGroup.patchValue(this.artefactDetail);
    this.artefactService.previousArtefactDetail = this.formGroup.value;
  }

  setYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
    this.formGroup.controls.originYear.setValue(
      normalizedMonthAndYear.toISOString()
    );
    datepicker.close();
  }

  // addArtist() {
  //   const dialogRef = this.dialog.open(CreateArtist, {
  //     data: {
  //       canDisplayTitle: true
  //     },
  //     width: '900px'
  //   });
  //   dialogRef.afterClosed().subscribe((res: boolean) => {
  //     if (res) {
  //       this.getArtistList();
  //     }
  //   });
  // }

  onDateChange(
    event: MatDatepickerInputEvent<Date>,
    control: AbstractControl
  ): void {
    event.value && control.patchValue(event.value?.toISOString());
  }

  addAuction() {
    this.auctionHistoryArray.push(
      this.tabFormService.auctionHistoryFormGroup()
    );
  }

  addInsurance() {
    this.insuranceHistoryArray.push(
      this.tabFormService.insuranceHistoryFormGroup()
    );
  }

  @Confirm()
  delete(index: number, type: HISTORY) {
    type === this.history.AUCTION
      ? this.auctionHistoryArray.removeAt(index)
      : this.insuranceHistoryArray.removeAt(index);
    this.dialogService.closeConfirmDialog();
  }

  onCheckboxChange(
    event: MatCheckboxChange,
    controlName: string,
    isFormArray = false
  ) {
    const checkboxValue = event.checked;
    const targetControl = isFormArray
      ? (this.formGroup.get(controlName) as FormArray)
      : (this.formGroup.get(controlName) as FormControl);

    if (isFormArray) {
      this.handleFormArrayCheckboxChange(
        targetControl as FormArray,
        checkboxValue
      );
    } else {
      this.handleFormControlCheckboxChange(
        targetControl as FormControl,
        checkboxValue
      );
    }
  }

  setKeywords(e: Event) {
    const searchStr = (e.target as HTMLInputElement).value;
    (e.target as HTMLInputElement).value = '';
    searchStr &&
      this.formGroup
        .get('keyword')
        .setValue([...this.formGroup.get('keyword').value, searchStr]);
  }

  private handleFormArrayCheckboxChange(
    formArray: FormArray,
    checkboxValue: boolean
  ) {
    if (checkboxValue) {
      this.tabFormService.addRequiredValidatorsToFormArray(formArray);
    } else {
      this.tabFormService.removeRequiredValidatorsFromFormArray(formArray);
    }
  }

  onClearDate(picker: MatDatepicker<unknown>, control: FormControl) {
    control.setValue(null);
    picker.close();
  }

  private handleFormControlCheckboxChange(
    formControl: FormControl,
    checkboxValue: boolean
  ) {
    if (checkboxValue) {
      this.tabFormService.addRequiredValidator(formControl);
    } else {
      this.tabFormService.removeRequiredValidator(formControl);
    }
  }
}
