import { NgClass, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_RATIO,
  MEDIA_SIZE,
  MEDIA_TABS
} from '@constants/app.constants';
import {
  ARTEFACT_MEDIA_FIELD,
  ARTEFACT_TABS,
  MEDIA_TYPE
} from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { MediaList } from '@models/artefact.model';
import { Media, TableColumn, UploadMediaDetail } from '@models/common.model';
import { ExtractFileNamePipe } from '@pipes/extract-file-name.pipe';
import { ArtefactService } from '@services/artefact.service';
import { DialogService } from '@services/dialog.service';
import { MediaUploadService } from '@services/media-upload.service';
import { TabFormService } from '@services/tab-form.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcMediaDialogComponent } from '@vc-libs/vc-media-dialog/vc-media-dialog.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';
import { finalize } from 'rxjs';

const modules = [
  FormsModule,
  NgSelectModule,
  TranslateModule,
  MatSlideToggleModule
];
const components = [SvgIconComponent, VcButtonComponent, VcTableComponent];
const pipes = [ExtractFileNamePipe];

@Component({
  selector: 'app-media-form',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    TitleCasePipe,
    ...modules,
    ...components,
    ...pipes
  ],
  templateUrl: './media-form.component.html'
})
export class MediaFormComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('imageInput', { static: false }) imageInput: ElementRef;

  type = MEDIA_TYPE.IMAGE;
  image = {
    url: ''
  } as Media;
  file = {
    url: ''
  } as Media;
  allowDownload = false;
  supportedFileTypes: string[] = APP.IMAGE_TYPE;
  mediaList = new MatTableDataSource<MediaList>();
  totalData = 0;
  columns: TableColumn[] = [
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'mediaType',
      label: 'artefact.mediaType'
    },
    {
      key: 'coverUrl',
      label: 'artefact.image'
    },
    {
      key: 'url',
      label: 'artefact.file'
    },
    {
      key: 'coverImage',
      label: 'artefact.coverImage'
    }
  ];
  paginator: PageEvent;
  imageExtension: string;
  fileExtension: string;
  isSubmitted = false;
  loader = false;
  mediaListLoader = false;
  cdkDragDisabled = false;
  previousMediaDetail: { type: MEDIA_TYPE; file: Media; image?: Media } = {
    type: MEDIA_TYPE.IMAGE,
    file: { url: '', file: null },
    image: { url: '', file: null }
  };
  isFirstTimeLoad = true;

  @Input() id: string;
  @Input() set isDownload(value: boolean) {
    this.allowDownload = value;
  }

  readonly mediaType = MEDIA_TYPE;
  readonly availableMediaTypes = Object.keys(MEDIA_TYPE).map((key) => ({
    label: `${key.charAt(0).toUpperCase()}${key.substring(1).toLowerCase()}`,
    value: MEDIA_TYPE[key as keyof typeof MEDIA_TYPE]
  }));
  readonly imageType = APP.IMAGE_TYPE;
  readonly field = ARTEFACT_MEDIA_FIELD;
  readonly extension = MEDIA_EXTENSION.IMAGE;
  readonly size = MEDIA_SIZE.IMAGE;
  readonly imageRatio = MEDIA_RATIO.ARTEFACT_COVER_IMAGE;
  previewMediaExtension = MEDIA_EXTENSION.IMAGE;
  previewMediaSize = MEDIA_SIZE.IMAGE;
  previousFiles: File;

  #destroyRef = inject(DestroyRef);

  constructor(
    private tabFormService: TabFormService,
    private artefactService: ArtefactService,
    private mediaUploadService: MediaUploadService,
    private dialogService: DialogService,
    private toasterService: ToasterService,
    private utilityService: UtilityService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.id) {
      this.getMediaList();
    }
    this.getMediaStatus();
  }

  getMediaList(loaderValue = true) {
    this.mediaListLoader = loaderValue;
    this.artefactService
      .getMediaList(this.id, MEDIA_TABS.PREVIEW_MEDIA)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.mediaListLoader = false))
      )
      .subscribe((res) => {
        if (!this.isFirstTimeLoad) {
          res.data[0].base64 =
            this.previousMediaDetail.type === MEDIA_TYPE.IMAGE
              ? this.previousMediaDetail.file.url
              : this.previousMediaDetail.image.url;
        }
        this.mediaList = new MatTableDataSource(res.data);
        this.setCdkDragDisabledValue(this.mediaList.data);
      });
  }

  getMediaStatus() {
    this.mediaUploadService.mediaUploaded$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.isFirstTimeLoad = false;
        this.mediaList = new MatTableDataSource([]);
        res === ARTEFACT_TABS.PREVIEW_MEDIA && this.getMediaList();
      });
  }

  onFileChange(
    event: Event,
    mediaType = MEDIA_TYPE.IMAGE,
    preview = false
  ): void {
    const target = event.target as HTMLInputElement;
    const file = target.files[0];

    if (file) {
      const isValid = this.tabFormService.checkValidation(file, mediaType);
      if (!isValid) {
        if (preview) {
          this.fileInput.nativeElement.value = '';
        } else {
          this.imageInput.nativeElement.value = '';
        }
        return;
      }
      this.previousFiles = file;
      this.storeMediaExtension(file, mediaType);
      const media = preview ? this.file : this.image;
      media.file = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        media.url = reader.result as string;
      };
    } else {
      if (this.previousFiles) {
        const fileList = new DataTransfer();
        fileList.items.add(this.previousFiles);
        target.files = fileList.files;
      }
    }
  }

  storeMediaExtension(file: File, mediaType: MEDIA_TYPE) {
    let fileExtension = this.utilityService.getFileExtension(file);
    fileExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    if (mediaType === MEDIA_TYPE.IMAGE) {
      this.imageExtension = fileExtension;
    } else {
      this.fileExtension = fileExtension;
    }
  }

  onTypeChange(value: MEDIA_TYPE): void {
    this.file = { url: '', file: null };
    this.image = { url: '', file: null };
    this.resetInputValue();
    switch (value) {
      case MEDIA_TYPE.IMAGE:
        this.supportedFileTypes = APP.IMAGE_TYPE;
        this.previewMediaExtension = MEDIA_EXTENSION.IMAGE;
        this.previewMediaSize = MEDIA_SIZE.IMAGE;
        break;
      case MEDIA_TYPE.VIDEO:
        this.supportedFileTypes = APP.VIDEO_TYPE;
        this.previewMediaExtension = MEDIA_EXTENSION.VIDEO;
        this.previewMediaSize = MEDIA_SIZE.VIDEO;
        break;
      case MEDIA_TYPE.AUDIO:
        this.supportedFileTypes = APP.AUDIO_TYPE;
        this.previewMediaExtension = MEDIA_EXTENSION.AUDIO;
        this.previewMediaSize = MEDIA_SIZE.AUDIO;
        break;
      case MEDIA_TYPE.DOCUMENT:
        this.supportedFileTypes = APP.DOCUMENT_TYPE;
        this.previewMediaExtension = MEDIA_EXTENSION.DOCUMENT;
        this.previewMediaSize = MEDIA_SIZE.DOCUMENT;
        break;
      case MEDIA_TYPE['3D']:
        this.supportedFileTypes = APP['3D_TYPE'];
        this.previewMediaExtension = MEDIA_EXTENSION['3D'];
        this.previewMediaSize = MEDIA_SIZE['3D'];
        break;
    }
  }

  save(): void {
    this.isSubmitted = true;

    const isImageType = this.type === MEDIA_TYPE.IMAGE;
    if (!this.file.url || (!isImageType && !this.image.url)) return;
    this.loader = true;

    const extensionType: { extension: string; fileName: string }[] = [
      {
        extension: this.imageExtension,
        fileName: (isImageType ? this.file : this.image).file.name.replace(
          /\.[^/.]+$/,
          ''
        )
      }
    ];
    if (this.fileExtension && !isImageType) {
      extensionType.unshift({
        extension: this.fileExtension,
        fileName: this.file.file.name.replace(/\.[^/.]+$/, '')
      });
    }

    const payload = {
      mediaType: this.type,
      moduleName: 'artefact',
      tabName: MEDIA_TABS.PREVIEW_MEDIA,
      extensionType: JSON.stringify(extensionType)
    };
    this.artefactService
      .getUploadMediaUrl(this.id, payload)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.loader = false))
      )
      .subscribe((res) => {
        const mediaDetail: UploadMediaDetail[] = [
          this.utilityService.createMediaDetail(
            res.data._id,
            res.data.url,
            this.file.file
          )
        ];
        if (!isImageType) {
          mediaDetail.push(
            this.utilityService.createMediaDetail(
              res.data._id,
              res.data.coverUrl,
              this.image.file
            )
          );
        }
        this.mediaUploadService.mediaDetail$.next(mediaDetail);
        this.resetMediaDetails();
        this.resetInputValue();
      });
  }

  resetMediaDetails() {
    this.previousMediaDetail.type = this.type;
    this.previousMediaDetail.file = this.file;
    this.previousMediaDetail.image = this.image;

    this.type = MEDIA_TYPE.IMAGE;
    this.file = { url: '', file: null };
    this.image = { url: '', file: null };
    this.isSubmitted = false;
    this.onTypeChange(this.type);
  }

  resetInputValue() {
    this.fileInput && (this.fileInput.nativeElement.value = '');
    this.imageInput && (this.imageInput.nativeElement.value = '');
  }

  @Confirm()
  deleteMedia(row: MediaList) {
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
        const index = this.mediaList.data.findIndex(
          (user) => user._id === row._id
        );
        this.mediaList.data.splice(index, 1);
        this.mediaList = new MatTableDataSource(this.mediaList.data);
        this.setCdkDragDisabledValue(this.mediaList.data);
      });
  }

  updateStatus(field: ARTEFACT_MEDIA_FIELD, value: boolean | MediaList) {
    const id = typeof value === 'boolean' ? this.id : value._id;
    const payload = {
      field,
      value: typeof value === 'boolean' ? value : value.isPreview
    };
    typeof value !== 'boolean' &&
      this.mediaList.data.forEach(
        (media) => (media.isPreview = media._id === value._id)
      );
    this.artefactService
      .updateArtefactMedia(id, payload)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (res) => {
          this.toasterService.display(res.message);
        },
        error: () => {
          if (typeof value !== 'boolean') {
            value.isPreview = !payload.value;
          } else {
            this.allowDownload = !payload.value;
          }
        }
      });
  }

  openModal(mediaType: MEDIA_TYPE, url: string) {
    if (mediaType === MEDIA_TYPE['3D']) {
      this.dialog.open(VcMediaDialogComponent, {
        width: '100%',
        maxWidth: '90vw',
        height: '100vh',
        maxHeight: '100vh',
        data: { url }
      });
    } else {
      window.open(url, '_blank');
    }
  }

  setCdkDragDisabledValue(data: MediaList[]) {
    this.cdkDragDisabled = data.length <= 1;
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    moveItemInArray(
      this.mediaList.data,
      event.previousIndex,
      event.currentIndex
    );
    this.mediaList = new MatTableDataSource(this.mediaList.data);
    this.mediaList.data.forEach((item, index) => (item.index = index));
    const payload = this.mediaList.data.map((item) => ({
      mediaId: item._id,
      index: item.index + 1
    }));

    this.artefactService
      .updateMediaOrder(this.id, payload)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }
}
