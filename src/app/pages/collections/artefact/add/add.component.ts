import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { ARTEFACT_TABS } from '@constants/app.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ArtefactDetail, ArtefactMetaData } from '@models/artefact.model';
import { APIResponseModel } from '@models/common.model';
import { AudioFormComponent } from '@pages/collections/artefact/add/audio-form/audio-form.component';
import { DocumentFormComponent } from '@pages/collections/artefact/add/document-form/document-form.component';
import { GeneralFormComponent } from '@pages/collections/artefact/add/general-form/general-form.component';
import { ImageFormComponent } from '@pages/collections/artefact/add/image-form/image-form.component';
import { MediaFormComponent } from '@pages/collections/artefact/add/media-form/media-form.component';
import { MetadataFormComponent } from '@pages/collections/artefact/add/metadata-form/metadata-form.component';
import { VideoFormComponent } from '@pages/collections/artefact/add/video-form/video-form.component';
import { ArtefactService } from '@services/artefact.service';
import { TabFormService } from '@services/tab-form.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcDynamicFormComponent } from '@vc-libs/vc-dynamic-form/vc-dynamic-form.component';
import { finalize } from 'rxjs';

const modules = [MatTabsModule, TranslateModule, NgSelectModule];
const components = [
  VcDynamicFormComponent,
  VcButtonComponent,
  GeneralFormComponent,
  MediaFormComponent,
  SvgIconComponent,
  VideoFormComponent,
  ImageFormComponent,
  DocumentFormComponent,
  AudioFormComponent,
  MetadataFormComponent
];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [...modules, ...components],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  @Input() _id: string;
  @Input() artefactDetail: APIResponseModel<ArtefactDetail>;

  isSubmitted = false;
  isSubmittedClose = false;
  previousTabIndex = this.currentTabIndex;
  isTabSwitch = false;

  readonly artefactTabs = ARTEFACT_TABS;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tabFormService: TabFormService,
    private artefactService: ArtefactService,
    private utilityService: UtilityService,
    private toasterService: ToasterService
  ) {}

  get tabs() {
    return this.tabFormService.tabs;
  }

  get tabFormFieldsGroup() {
    return this.tabFormService.tabFormFieldsGroup;
  }

  get tabFormGroups() {
    return this.tabFormService.tabFormGroups;
  }

  get areTabsDisabled() {
    return !this.artefactService.artefactId;
  }

  get currentTabIndex() {
    return this.tabFormService.currentTabIndex;
  }

  set currentTabIndex(value) {
    this.tabFormService.currentTabIndex = value;
  }

  get artefactId() {
    return this._id || this.artefactService.artefactId;
  }

  ngOnInit() {
    this.artefactService.artefactId = '';
    this.tabFormService.tabIndexChange$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((tabIndex) => (this.currentTabIndex = tabIndex));
    this.tabFormService.init();
    this.tabFormService.prepareGeneralTab();
    this.tabFormService.prepareMediaTab();
    this.tabFormService.prepareVideoTab();
    this.tabFormService.prepareImageTab();
    this.tabFormService.prepareDocumentTab();
    this.tabFormService.prepareAudioTab();
    this.tabFormService.prepareMetaDataTab();
  }

  tabChanged(event: MatTabChangeEvent): void {
    this.isTabSwitch = false;
    const data = this.tabFormGroups[this.previousTabIndex];
    if (
      this.previousTabIndex === this.artefactTabs.GENERAL &&
      this.artefactId &&
      !this.utilityService.areObjectsSimilar(
        this.artefactService.previousArtefactDetail,
        data.value
      ) &&
      this.tabFormGroups[this.previousTabIndex].valid
    ) {
      this.updatePredefinedData(false, this.previousTabIndex);
      this.isTabSwitch = true;
    }
    this.previousTabIndex = event.index;
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  save(isClose = false) {
    this.tabFormGroups[this.currentTabIndex].markAllAsTouched();
    if (this.tabFormGroups[this.currentTabIndex].invalid) {
      return;
    }

    if (this.currentTabIndex === this.artefactTabs.GENERAL) {
      this.artefactId
        ? this.updatePredefinedData(isClose, this.currentTabIndex)
        : this.savePredefinedData(isClose);
    } else {
      this.saveMetaData(isClose);
    }
  }

  getPayload(index: ARTEFACT_TABS) {
    const data = JSON.parse(JSON.stringify(this.tabFormGroups[index].value));
    if (index === this.artefactTabs.GENERAL) {
      data.keyword =
        data.keyword?.map((k) => (typeof k === 'string' ? k : k.label)) || [];
    }
    data.auctionHistory = this.utilityService.removeNullBlankEmptyKeys(
      data.auctionHistory
    );
    data.insuranceHistory = this.utilityService.removeNullBlankEmptyKeys(
      data.insuranceHistory
    );
    data.previewFields = this.getTrueKeys(data.previewFields);
    return data;
  }

  getTrueKeys(obj: Record<string, boolean>): string[] {
    return Object.keys(obj).filter((key) => obj[key]);
  }

  savePredefinedData(isClose: boolean) {
    const loadingState = isClose ? 'isSubmittedClose' : 'isSubmitted';
    this[loadingState] = true;

    this.artefactService
      .create(this.getPayload(this.currentTabIndex))
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this[loadingState] = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.artefactService.artefactId = res.data.id;
        isClose && this.navigateToList();
      });
  }

  updatePredefinedData(isClose: boolean, index: ARTEFACT_TABS) {
    const loadingState = isClose ? 'isSubmittedClose' : 'isSubmitted';
    this[loadingState] = true;
    this.artefactService
      .update(this.artefactId, this.getPayload(index))
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this[loadingState] = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        isClose && this.navigateToList();
      });
  }

  saveMetaData(isClose: boolean) {
    const payload = this.getPayload(this.currentTabIndex);
    const transformedPayload: ArtefactMetaData = {
      previewFields: [],
      metaData: null
    };
    transformedPayload.previewFields = payload.previewFields;
    delete payload.previewFields;
    transformedPayload.metaData = payload;
    const loadingState = isClose ? 'isSubmittedClose' : 'isSubmitted';
    this[loadingState] = true;
    this.artefactService
      .saveMetaData(this.artefactId, transformedPayload)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this[loadingState] = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        isClose && this.navigateToList();
      });
  }

  switchTab(index: number) {
    this.tabFormService.selectTab(index);
  }
}
