import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_RATIO,
  MEDIA_SIZE,
  REGEX
} from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ConfigurationForm } from '@models/member.model';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@services/dialog.service';
import { MemberService } from '@services/member.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';

const modules = [ReactiveFormsModule, TranslateModule, MatExpansionModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './configuration.component.html',
  styles: [
    `
      .mat-expanded .mat-expansion-panel-header-description,
      .mat-expanded .mat-expansion-panel-header-title {
        color: white;
      }
      .mat-expanded mat-expansion-panel-header {
        background-color: #3367b1;
        border-radius: unset;
      }
    `
  ]
})
export class ConfigurationComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  configurationForm: FormGroup<ConfigurationForm>;
  isSubmitted = false;
  bannerExtension: string;

  readonly imageType = APP.IMAGE_TYPE;
  readonly extension = MEDIA_EXTENSION.IMAGE;
  readonly size = MEDIA_SIZE.IMAGE;
  readonly ratio = MEDIA_RATIO.HOME_LOGO;

  constructor(
    private dialogService: DialogService,
    private utilityService: UtilityService,
    private memberService: MemberService,
    private toasterService: ToasterService
  ) {}

  get formControls(): ConfigurationForm {
    return this.configurationForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.configurationForm = new FormGroup<ConfigurationForm>({
      logo: new FormControl(null),
      homeThumbnail: new FormControl(null),
      title: new FormControl(''),
      disclaimer: new FormControl(''),
      headingTitle: new FormControl(''),
      galleryTitle: new FormControl(''),
      categoryTitle: new FormControl(''),
      headingDescription: new FormControl(''),
      galleryDescription: new FormControl(''),
      categoryDescription: new FormControl(''),
      searchArtefacts: new FormControl(''),
      galleryPageDescription: new FormControl(''),
      historyAndEducationPageDescription: new FormControl(''),
      exhibitionPageDescription: new FormControl(''),
      feedback: new FormControl(''),
      infoEmail: new FormControl('', [Validators.pattern(REGEX.EMAIL)]),
      facebook: new FormControl('', [Validators.pattern(REGEX.FACEBOOK)]),
      twitter: new FormControl('', [Validators.pattern(REGEX.TWITTER)]),
      instagram: new FormControl('', [Validators.pattern(REGEX.INSTAGRAM)]),
      youtube: new FormControl('', [Validators.pattern(REGEX.YOUTUBE)]),
      linkedin: new FormControl('', [Validators.pattern(REGEX.LINKEDIN)])
    });
  }

  async onFileChange(event: Event, field: 'logo' | 'homeThumbnail') {
    const imageDetail = await this.utilityService.handleImageFileInput(event);
    this.formControls[field].setValue(imageDetail);
  }

  @Confirm()
  removeImage(field: 'logo' | 'homeThumbnail') {
    this.formControls[field].setValue(null);
    this.dialogService.closeConfirmDialog();
  }

  onSubmit() {
    this.configurationForm.markAllAsTouched();
    if (this.configurationForm.invalid) {
      return;
    }

    const configurationData = this.utilityService.removeNullBlankEmptyKeys(
      this.configurationForm.value
    );
    if (Object.keys(configurationData).length) {
      this.isSubmitted = true;
      this.memberService
        .updateConfiguration(configurationData)
        .pipe(
          takeUntilDestroyed(this.#destroyRef),
          finalize(() => (this.isSubmitted = false))
        )
        .subscribe((res) => this.toasterService.display(res.message));
    }
  }
}
