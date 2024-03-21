import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_SIZE,
  MEDIA_TABS
} from '@constants/app.constants';
import { ARTEFACT_TABS, MEDIA_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { MediaList } from '@models/artefact.model';
import { UploadMediaDetail } from '@models/common.model';
import { ExtractFileNamePipe } from '@pipes/extract-file-name.pipe';
import { ArtefactService } from '@services/artefact.service';
import { DialogService } from '@services/dialog.service';
import { MediaUploadService } from '@services/media-upload.service';
import { TabFormService } from '@services/tab-form.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';

const modules = [
  ReactiveFormsModule,
  NgSelectModule,
  TranslateModule,
  MatSlideToggleModule,
  MatProgressBarModule
];
const components = [VcInputComponent, SvgIconComponent, VcButtonComponent];
const pipes = [ExtractFileNamePipe];

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components, ...pipes],
  templateUrl: './document-form.component.html'
})
export class DocumentFormComponent implements OnInit {
  documentList: MediaList[] = [];
  documentListLoader = false;

  readonly documentType = APP.DOCUMENT_TYPE;
  readonly extension = MEDIA_EXTENSION.DOCUMENT;
  readonly size = MEDIA_SIZE.DOCUMENT;
  readonly type = MEDIA_TYPE.DOCUMENT;
  #destroyRef = inject(DestroyRef);

  @Input() id: string;

  constructor(
    private tabFormService: TabFormService,
    private dialogService: DialogService,
    private mediaUploadService: MediaUploadService,
    private artefactService: ArtefactService,
    private toasterService: ToasterService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    this.getMediaList();
    this.getMediaStatus();
  }

  getMediaList(loaderValue = true) {
    this.documentListLoader = loaderValue;
    this.artefactService
      .getMediaList(this.id, MEDIA_TABS.DOCUMENT)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.documentListLoader = false))
      )
      .subscribe((res) => {
        this.documentList = res.data;
      });
  }

  getMediaStatus() {
    this.mediaUploadService.mediaUploaded$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        res === ARTEFACT_TABS.DOCUMENTS && this.getMediaList(false);
      });
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files[0];

    if (file) {
      const isValid = this.tabFormService.checkValidation(file, this.type);
      if (!isValid) {
        target.value = '';
        return;
      }
      this.uploadDocument(file);
    }
  }

  uploadDocument(file: File) {
    const payload = {
      mediaType: this.type,
      moduleName: 'artefact',
      tabName: MEDIA_TABS.DOCUMENT,
      extensionType: JSON.stringify([
        {
          extension: this.utilityService.getFileExtension(file),
          fileName: file.name.replace(/\.[^/.]+$/, '')
        }
      ])
    };

    this.artefactService
      .getUploadMediaUrl(this.id, payload)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const mediaDetail: UploadMediaDetail[] = [
          this.utilityService.createMediaDetail(
            res.data._id,
            res.data.url,
            file
          )
        ];
        this.mediaUploadService.mediaDetail$.next(mediaDetail);
      });
  }

  @Confirm()
  deleteDocument(row: MediaList) {
    this.dialogService.isLoading = true;
    this.mediaUploadService
      .deleteMedia(row._id)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.documentList.findIndex(
          (video) => video._id === row._id
        );
        this.documentList.splice(index, 1);
      });
  }

  previewDocument(control: MediaList): void {
    if (this.tabFormService.isPlatformIsBrowser()) {
      window.open(control.url);
    }
  }
}
