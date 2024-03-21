import { JsonPipe, NgClass, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { TOASTER_TYPE } from '@constants/app.enums';
import { APIResponseModel } from '@models/common.model';
import { AddRoleForm, Permission, Role } from '@models/role.model';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { RoleService } from '@services/role.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [ReactiveFormsModule, TranslateModule];
const components = [VcButtonComponent, VcInputComponent];
const pipes = [TitleCasePipe, JsonPipe];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components, ...pipes],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  @Input() _id: string;
  @Input() roleDetail: APIResponseModel<Role>;

  addRoleForm: FormGroup<AddRoleForm>;
  isSubmitted$ = signal(false);
  permissions$ = signal<Permission[]>([]);
  selectedPermissions$ = signal<string[]>([]);

  constructor(
    private route: ActivatedRoute,
    private roleService: RoleService,
    private toasterService: ToasterService,
    private router: Router,
    private customValidatorService: CustomValidatorService,
    private breadcrumbService: BreadcrumbService
  ) { }

  get formControls(): AddRoleForm {
    return this.addRoleForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    this.getAllPermissions();
    if (this._id) {
      this.formControls.name.patchValue(this.roleDetail.data.name);
      this.selectedPermissions$.set(this.roleDetail.data.permissions);
      this.emitBreadcrumbDetail();
    }
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.roleDetail.data.name
    });
  }

  getAllPermissions() {
    this.roleService
      .getAllPermissions()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => (this.permissions$.set(res.data)));
  }

  initializeForm() {
    this.addRoleForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        this.customValidatorService.notWhitespace
      ])
    });
  }

  onSubmit() {
    this.addRoleForm.markAllAsTouched();
    if (this.addRoleForm.invalid) {
      return;
    }

    if (this.selectedPermissions$().length === 0) {
      this.toasterService.displayTranslation(
        'validation.permissionRequired',
        TOASTER_TYPE.ERROR
      );
      return;
    }

    this.isSubmitted$.set(true);
    if (!this._id) {
      this.addRole();
    } else {
      this.updateRole();
    }
  }

  getPayload(): Partial<Role> {
    return {
      ...this.addRoleForm.value,
      permissions: this.selectedPermissions$()
    };
  }

  addRole() {
    this.roleService
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

  updateRole() {
    this.roleService
      .update(this._id, this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  changePermission(e: Event) {
    const permissionCheckbox = e.target as HTMLInputElement;
    if (permissionCheckbox.checked) {
      this.selectedPermissions$().push(permissionCheckbox.value);
    } else {
      this.selectedPermissions$.update(
        (val) => val.filter((item) => item !== permissionCheckbox.value)
      );
    }
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  checkAllInModule(e: Event, permissions: Permission[]) {
    const modulePermissions = e.target as HTMLInputElement;
    if (modulePermissions.checked) {
      this.selectedPermissions$().push(...permissions.map((p) => p._id));
    } else {
      this.selectedPermissions$.update(
        (val) => val.filter((item) => !permissions.map((p) => p._id).includes(item)));
    }
  }
}
