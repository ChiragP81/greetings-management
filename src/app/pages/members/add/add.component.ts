import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { APIResponseModel, OptionsDetail } from '@models/common.model';
import { AddMemberForm, Member } from '@models/member.model';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { MemberService } from '@services/member.service';
import { RoleService } from '@services/role.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcTelInputComponent } from '@vc-libs/vc-tel-input/vc-tel-input.component';

const modules = [
  MatSlideToggleModule,
  NgSelectModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule
];
const components = [VcButtonComponent, VcInputComponent, VcTelInputComponent];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  _id$ = input<string>(undefined, { alias: '_id' });
  memberDetail$ = input<APIResponseModel<Member>>(undefined, { alias: 'memberDetail' });

  addMemberForm: FormGroup<AddMemberForm>;
  isSubmitted$ = signal(false);
  roleList$ = signal<OptionsDetail[]>([]);

  readonly emailRegex = REGEX.EMAIL;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private toasterService: ToasterService,
    private router: Router,
    private roleService: RoleService,
    private customValidatorService: CustomValidatorService,
    private breadcrumbService: BreadcrumbService
  ) { }

  get formControls(): AddMemberForm {
    return this.addMemberForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    this.getRoleList();
    if (this._id$()) {
      this.addMemberForm.patchValue(this.memberDetail$().data);
      this.emitBreadcrumbDetail();
    }
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.memberDetail$().data.firstName
    });
  }

  initializeForm() {
    this.addMemberForm = new FormGroup<AddMemberForm>({
      isActive: new FormControl(true, Validators.required),
      firstName: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      lastName: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(REGEX.EMAIL),
        this.customValidatorService.notWhitespace
      ]),
      userName: new FormControl(),
      role: new FormControl([], Validators.required)
    });
  }

  getRoleList(): void {
    this.roleService
      .getRoleList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.roleList$.set(res);
      });
  }

  onSubmit() {
    this.addMemberForm.markAllAsTouched();
    if (this.addMemberForm.invalid) {
      return;
    }

    this.isSubmitted$.set(true);
    if (!this._id$()) {
      this.addMember();
    } else {
      this.updateMember();
    }
  }

  getPayload(): Partial<Member> {
    const memberData = this.addMemberForm.value;
    const payload = {
      // ...(memberData.role && { roles: memberData.role }),
      ...memberData
    };
    // delete payload.role;
    return payload;
  }

  addMember(): void {
    this.memberService
      .create(this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  updateMember(): void {
    this.memberService
      .update(this._id$(), this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
