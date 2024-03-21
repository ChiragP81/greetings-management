import {
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_RATIO,
  MEDIA_SIZE,
  MEDIA_TABS
} from '@constants/app.constants';
import { ARTEFACT_TABS, MEDIA_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { MediaList } from '@models/artefact.model';
import { Media, UploadMediaDetail } from '@models/common.model';
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
  NgSelectModule,
  TranslateModule,
  MatSlideToggleModule,
  MatProgressBarModule
];
const components = [VcInputComponent, SvgIconComponent, VcButtonComponent];
const pipes = [ExtractFileNamePipe];

@Component({
  selector: 'app-video-form',
  standalone: true,
  templateUrl: './video-form.component.html',
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components, ...pipes]
})
export class VideoFormComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('imageInput', { static: false }) imageInput: ElementRef;

  videoList: MediaList[] = [];
  videoListLoader = false;
  isSubmitted = false;
  loader = false;
  image = {
    url: ''
  } as Media;
  file = {
    url: ''
  } as Media;

  imgExtension: string;
  videoExtension: string;
  previousFiles: File;

  readonly videoType = APP.VIDEO_TYPE;
  readonly imageType = APP.IMAGE_TYPE;
  readonly videoFormat = MEDIA_EXTENSION.VIDEO;
  readonly imageFormat = MEDIA_EXTENSION.IMAGE;
  readonly videoSize = MEDIA_SIZE.VIDEO;
  readonly imageSize = MEDIA_SIZE.IMAGE;
  readonly type = MEDIA_TYPE.VIDEO;
  readonly mediaType = MEDIA_TYPE;
  readonly imageRatio = MEDIA_RATIO.ARTEFACT_IMAGE;

  #destroyRef = inject(DestroyRef);

  @Input() id: string;

  constructor(
    private tabFormService: TabFormService,
    private dialogService: DialogService,
    private mediaUploadService: MediaUploadService,
    private artefactService: ArtefactService,
    private toasterService: ToasterService,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    this.getMediaList();
    this.getMediaStatus();
  }

  getMediaList(loaderValue = true) {
    this.videoListLoader = loaderValue;
    this.artefactService
      .getMediaList(this.id, MEDIA_TABS.VIDEO)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.videoListLoader = false))
      )
      .subscribe((res) => {
        this.videoList = res.data;
      });
  }

  getMediaStatus() {
    this.mediaUploadService.mediaUploaded$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        res === ARTEFACT_TABS.VIDEOS && this.getMediaList(false);
      });
  }

  onFileChange(event: Event, type: MEDIA_TYPE): void {
    const target = event.target as HTMLInputElement;
    const file = target.files[0];

    if (file) {
      const isValid = this.tabFormService.checkValidation(file, type);
      if (!isValid) {
        if (type === this.mediaType.VIDEO) {
          this.fileInput.nativeElement.value = '';
        } else {
          this.imageInput.nativeElement.value = '';
        }
        return;
      }
      this.previousFiles = file;
      this.storeMediaExtension(file, type);
      const media = type === this.mediaType.VIDEO ? this.file : this.image;
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

  save() {
    this.isSubmitted = true;
    if (this.image.url && this.file.url) {
      this.loader = true;
      this.uploadVideo();
    }
  }

  storeMediaExtension(file: File, mediaType: MEDIA_TYPE) {
    let fileExtension = this.utilityService.getFileExtension(file);
    fileExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    if (mediaType === MEDIA_TYPE.IMAGE) {
      this.imgExtension = fileExtension;
    } else {
      this.videoExtension = fileExtension;
    }
  }

  resetMediaDetails() {
    this.file = { url: '', file: null };
    this.image = { url: '', file: null };
    this.isSubmitted = false;
  }

  resetInputValue() {
    this.fileInput && (this.fileInput.nativeElement.value = '');
    this.imageInput && (this.imageInput.nativeElement.value = '');
  }

  uploadVideo() {
    const payload = {
      mediaType: this.type,
      moduleName: 'artefact',
      tabName: MEDIA_TABS.VIDEO,
      extensionType: JSON.stringify([
        {
          extension: this.videoExtension,
          fileName: this.file.file.name.replace(/\.[^/.]+$/, '')
        },
        {
          extension: this.imgExtension,
          fileName: this.image.file.name.replace(/\.[^/.]+$/, '')
        }
      ])
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
        const imageDetail: UploadMediaDetail[] = [
          this.utilityService.createMediaDetail(
            res.data._id,
            res.data.coverUrl,
            this.image.file
          )
        ];
        this.mediaUploadService.mediaDetail$.next(mediaDetail);
        this.mediaUploadService.mediaDetail$.next(imageDetail);
        this.resetMediaDetails();
        this.resetInputValue();
      });
  }

  previewVideo(control: MediaList): void {
    if (this.tabFormService.isPlatformIsBrowser()) {
      window.open(control.url);
    }
  }

  @Confirm()
  deleteVideo(row: MediaList) {
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
        const index = this.videoList.findIndex(
          (video) => video._id === row._id
        );
        this.videoList.splice(index, 1);
      });
  }
}
