import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ARTEFACT_TABS, LABEL_TYPE, METADATA_TABS } from '@constants/app.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ArtefactDetail } from '@models/artefact.model';
import { ArtefactService } from '@services/artefact.service';
import { MetadataService } from '@services/metadata.service';
import { TabFormService } from '@services/tab-form.service';
import { VcDynamicFormComponent } from '@vc-libs/vc-dynamic-form/vc-dynamic-form.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-metadata-form',
  standalone: true,
  imports: [
    SvgIconComponent,
    MatCheckboxModule,
    VcDynamicFormComponent,
    VcLoaderComponent
  ],
  templateUrl: './metadata-form.component.html'
})
export class MetadataFormComponent implements OnInit {
  @Input() id: string;

  isLoading = false;
  artefactDetail: ArtefactDetail;

  readonly artefact = ARTEFACT_TABS.METADATA;
  #destroyRef = inject(DestroyRef);

  constructor(
    private tabFormService: TabFormService,
    private metadataService: MetadataService,
    private artefactService: ArtefactService
  ) {}

  get tabs() {
    return this.tabFormService.tabs;
  }

  get tabFormGroups() {
    return this.tabFormService.tabFormGroups;
  }

  ngOnInit(): void {
    this.getArtefactDetail();
  }

  patchArtefactDetail() {
    if ('metaData' in this.artefactDetail.previewFields) {
      this.artefactDetail.previewFields.metaData?.forEach((key) => {
        const control =
          this.tabFormGroups[this.artefact].controls.previewFields.get(key);
        if (control) {
          control.setValue(true);
          this.tabs[this.artefact].fields.forEach((element) => {
            if (key === element._id) {
              const formControl = this.tabFormGroups[this.artefact].get(
                element._id
              ) as FormControl;
              element.checked = true;
              this.tabFormService.addRequiredValidator(formControl);
            }
          });
        }
      });
    }
    this.artefactDetail.metaData.forEach((element) => {
      this.tabFormGroups[this.artefact].controls[element._id].setValue(
        element.value
      );
    });
  }

  getMetadataForm(): void {
    this.isLoading = true;
    this.metadataService
      .getMetadataForm(METADATA_TABS.ARTEFACT, LABEL_TYPE.METADATA)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.tabs[this.artefact].fields = [];
        this.tabFormGroups[this.artefact] =
          this.tabFormService.createEmptyTabFormGroup();
        const previewFieldsFormGroup =
          this.tabFormService.createEmptyTabFormGroup();
        this.tabFormGroups[this.artefact].addControl(
          'previewFields',
          previewFieldsFormGroup
        );

        res.forEach((field) => {
          const validations = this.tabFormService.addDynamicValidation(field);
          this.tabs[this.artefact].fields.push(field);
          this.tabFormGroups[this.artefact].addControl(
            field._id,
            new FormControl('', validations)
          );
          previewFieldsFormGroup.addControl(field._id, new FormControl(false));
        });
        this.artefactDetail && this.patchArtefactDetail();
      });
  }

  getArtefactDetail() {
    this.isLoading = true;
    this.artefactService
      .getArtefactById(this.id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.artefactDetail = res.data;
        this.getMetadataForm();
      });
  }
}
