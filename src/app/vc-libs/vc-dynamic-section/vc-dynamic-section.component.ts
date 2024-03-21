/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { Media } from '@models/common.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_RATIO,
  MEDIA_SIZE
} from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { AllArtefactList } from '@models/artefact.model';
import { ExtractFileNamePipe } from '@pipes/extract-file-name.pipe';
import { ArtefactService } from '@services/artefact.service';
import { DialogService } from '@services/dialog.service';
import { UtilityService } from '@services/utility.service';
import { CustomValidatorService } from '@services/validator.service';
import { SECTION_TYPE, Section } from '@vc-libs/types';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [
  ReactiveFormsModule,
  TranslateModule,
  NgxEditorModule,
  NgSelectModule,
  MatRadioModule
];
const components = [VcInputComponent, VcButtonComponent, SvgIconComponent];
const pipes = [ExtractFileNamePipe];

@Component({
  selector: 'app-vc-dynamic-section',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    TitleCasePipe,
    CdkDrag,
    CdkDropList,
    CdkDragPlaceholder,
    ...modules,
    ...components,
    ...pipes
  ],
  templateUrl: './vc-dynamic-section.component.html'
})
export class VcDynamicSectionComponent implements OnInit, OnDestroy {
  #destroyRef = inject(DestroyRef);
  sectionCtrl = new FormControl();
  @Input() isExhibition: boolean = false;
  @Input() parentFormGroup: FormGroup<any>;
  @Input() perSelectedSection: Section[] = [];
  @Output() selectedSectionChange: EventEmitter<any> = new EventEmitter<any>();

  sectionList = [
    {
      value: 'text',
      label: 'Text'
    },
    {
      value: 'image',
      label: 'Image'
    },
    {
      value: 'video',
      label: 'Video'
    },
    {
      value: 'textWithImage',
      label: 'Text with Image'
    }
  ];

  selectedSection = [];
  editor: Editor;
  textEditor: Editor;
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
  exhibitionList = [
    {
      value: 'banner',
      label: 'Banner Image'
    },
    {
      value: 'artefact',
      label: 'Artefact'
    }
  ];
  imagePositions = [
    {
      value: 'left',
      label: 'Left'
    },
    {
      value: 'right',
      label: 'Right'
    }
  ];
  artefactList: AllArtefactList[];

  sectionType = SECTION_TYPE;
  readonly imageType = APP.IMAGE_TYPE;
  readonly extension = MEDIA_EXTENSION.IMAGE;
  readonly size = MEDIA_SIZE.CATEGORY_ITEM;
  readonly supportedFileTypes = APP.VIDEO_TYPE;
  readonly regexType = REGEX_TYPE;
  readonly awsUrl = environment.awsUrl;
  readonly videoExtension = MEDIA_EXTENSION.VIDEO;
  readonly videoSize = MEDIA_SIZE.VIDEO;
  readonly image = MEDIA_RATIO.DYNAMIC_IMAGE;
  readonly video = MEDIA_RATIO.DYNAMIC_VIDEO;
  readonly textWithImage = MEDIA_RATIO.DYNAMIC_TEXT_IMAGE;

  get dynamicFormControls(): any {
    return this.parentFormGroup.controls;
  }

  isMedia(value: string | Media): value is Media {
    return (value as Media).url !== undefined;
  }

  constructor(
    private utilityService: UtilityService,
    private dialogService: DialogService,
    private artefactService: ArtefactService,
    private customValidatorService: CustomValidatorService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.textEditor = new Editor();
    this.perSelectedSection.forEach((data) => this.addSection(data));

    if (this.isExhibition) {
      this.sectionList = [...this.sectionList, ...this.exhibitionList];
      this.getArtefactList();
    }
  }

  getArtefactList() {
    this.artefactService
      .getArtefactList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.artefactList = res.data;
      });
  }

  addSection(value?: Section): void {
    let maxIndex = this.selectedSection.reduce(
      (max, item) => (item.id > max ? item.id : max),
      -1
    );
    maxIndex = maxIndex === -1 ? 0 : maxIndex + 1;
    if (value) {
      this.sectionCtrl.setValue(value.type);
      maxIndex = value.index;
    }
    if (this.sectionCtrl.value) {
      switch (this.sectionCtrl.value) {
        case SECTION_TYPE.TEXT:
          this.addTextControl(maxIndex, value);
          break;
        case SECTION_TYPE.IMAGE:
          this.addImageControl(maxIndex, value);
          break;
        case SECTION_TYPE.VIDEO:
          this.addVideoControl(maxIndex, value);
          break;
        case SECTION_TYPE.BANNER:
          this.addBannerControl(maxIndex, value);
          break;
        case SECTION_TYPE.TEXT_WITH_IMAGE:
          this.addTextWithImageControl(maxIndex, value);
          break;
        case SECTION_TYPE.ARTEFACT:
          this.addArtefactControl(maxIndex, value);
      }
      this.selectedSection.push({ key: this.sectionCtrl.value, id: maxIndex });
      this.selectedSectionChange.emit(this.selectedSection);
      this.sectionCtrl.reset();
    }
  }

  addTextControl(index: number, value?: Section): void {
    const newVal = value?.asset ? value.asset : '';
    this.parentFormGroup.addControl(
      `text${index}`,
      new FormControl(newVal, [Validators.required])
    );
    this.textEditor[index] = new Editor();
  }

  addImageControl(index: number, value?: Section): void {
    this.parentFormGroup.addControl(
      `image${index}`,
      new FormControl(null, [Validators.required])
    );
    if (value?.asset) {
      this.parentFormGroup.controls[`image${index}`].setValue({
        url: `${this.awsUrl}${value.asset}`
      });
    }
  }

  addVideoControl(index: number, value?: Section): void {
    this.parentFormGroup.addControl(
      `video${index}`,
      new FormControl(null, [Validators.required])
    );
    this.parentFormGroup.addControl(
      `previewImage${index}`,
      new FormControl(null, [Validators.required])
    );
    if (value?.asset) {
      this.parentFormGroup.controls[`video${index}`].setValue({
        url: `${this.awsUrl}${value.asset}`
      });
      this.parentFormGroup.controls[`previewImage${index}`].setValue({
        url: `${this.awsUrl}${value.coverImage}`
      });
    }
  }

  addBannerControl(index: number, value?: Section): void {
    const title = value?.title ? value.title : '';
    const subtitle = value?.subtitle ? value.subtitle : '';
    this.parentFormGroup.addControl(
      `banner${index}`,
      new FormControl(null, [Validators.required])
    );
    this.parentFormGroup.addControl(
      `bannerTitle${index}`,
      new FormControl(title, [
        Validators.required,
        this.customValidatorService.notWhitespace
      ])
    );
    this.parentFormGroup.addControl(
      `subTitle${index}`,
      new FormControl(subtitle, [
        Validators.required,
        this.customValidatorService.notWhitespace
      ])
    );
    if (value?.asset) {
      this.parentFormGroup.controls[`banner${index}`].setValue({
        url: `${this.awsUrl}${value.asset}`
      });
    }
  }

  addTextWithImageControl(index: number, value?: Section): void {
    const text = value?.text ? value.text : '';
    const imagePosition = value?.imagePosition ? value.imagePosition : 'left';
    this.parentFormGroup.addControl(
      `itImage${index}`,
      new FormControl(null, [Validators.required])
    );
    this.parentFormGroup.addControl(
      `itText${index}`,
      new FormControl(text, [Validators.required])
    );
    this.parentFormGroup.addControl(
      `imagePosition${index}`,
      new FormControl(imagePosition)
    );
    this.editor[index] = new Editor();
    if (value?.asset) {
      this.parentFormGroup.controls[`itImage${index}`].setValue({
        url: `${this.awsUrl}${value.asset}`
      });
    }
  }

  addArtefactControl(index: number, value?: Section): void {
    this.parentFormGroup.addControl(
      `artefact${index}`,
      new FormControl([], [Validators.required])
    );
    if (value?.asset) {
      this.parentFormGroup.controls[`artefact${index}`].setValue(value.asset);
    }
  }

  async onFileChange(
    event: Event,
    fileType: string,
    index: number,
    formControlName?: string
  ) {
    if (fileType === SECTION_TYPE.IMAGE) {
      const imageDetail = await this.utilityService.handleImageFileInput(event);
      this.parentFormGroup.controls[formControlName + index].setValue(
        imageDetail
      );
    } else {
      const reader = new FileReader();
      const files = (event.target as HTMLInputElement).files;
      const imageDetail = { files, url: '' };
      reader.onload = () => {
        imageDetail.url = reader.result as string;
      };
      this.parentFormGroup.controls['video' + index].setValue(files);
    }
  }

  @Confirm()
  removeImageOrVideo(index: number, formControlName: string) {
    this.parentFormGroup.controls[formControlName + index].setValue(null);
    this.dialogService.closeConfirmDialog();
  }

  removeSection(index: number) {
    const data = this.selectedSection[index];
    switch (data.key) {
      case SECTION_TYPE.TEXT:
        this.parentFormGroup.removeControl('text' + data.id);
        break;
      case SECTION_TYPE.IMAGE:
        this.parentFormGroup.removeControl('image' + data.id);
        break;
      case SECTION_TYPE.VIDEO:
        this.parentFormGroup.removeControl('video' + data.id);
        this.parentFormGroup.removeControl('previewImage' + data.id);
        break;
      case SECTION_TYPE.BANNER:
        this.parentFormGroup.removeControl('bannerImage' + data.id);
        this.parentFormGroup.removeControl('bannerTitle' + data.id);
        this.parentFormGroup.removeControl('subTitle' + data.id);
        break;
      case SECTION_TYPE.TEXT_WITH_IMAGE:
        this.parentFormGroup.removeControl('itImage' + data.id);
        this.parentFormGroup.removeControl('itText' + data.id);
        this.parentFormGroup.removeControl('imagePosition' + data.id);
        break;
      case SECTION_TYPE.ARTEFACT:
        this.parentFormGroup.removeControl('artefact' + data.id);
    }
    this.editor[data.id]?.destroy();
    this.textEditor[data.id]?.destroy();
    this.selectedSection.splice(index, 1);
    this.selectedSectionChange.emit(this.selectedSection);
  }

  previewVideo(control: { url: string; }): void {
    window.open(control.url);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  ngOnDestroy(): void {
    this.selectedSection.forEach((d) => {
      this.editor[d.id]?.destroy();
      this.textEditor[d.id]?.destroy();
    });
    this.editor?.destroy();
    this.textEditor?.destroy();
  }
}
