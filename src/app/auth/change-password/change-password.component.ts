import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import {
  ChangePasswordForm,
  ChangePasswordPayload,
  PasswordType
} from '@models/auth.model';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [TranslateModule, ReactiveFormsModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ...modules, ...components],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  changePasswordForm: FormGroup<ChangePasswordForm>;
  isLoading = false;
  passwordFieldType: PasswordType = 'password';
  confirmPasswordFieldType: PasswordType = 'password';
  oldPasswordFieldType: PasswordType = 'password';

  constructor(
    private customValidatorService: CustomValidatorService,
    private toasterService: ToasterService,
    private authService: AuthService
  ) {}

  get formControls(): ChangePasswordForm {
    return this.changePasswordForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.changePasswordForm = new FormGroup<ChangePasswordForm>(
      {
        oldPassword: new FormControl('', Validators.required),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(REGEX.PASSWORD)
        ]),
        confirmPassword: new FormControl('', Validators.required)
      },
      this.customValidatorService.passwordMatchValidator()
    );
  }

  changePassword(): void {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) return;
    this.isLoading = true;
    const params = {
      password: this.formControls.oldPassword.value,
      newPassword: this.formControls.password.value
    };
    this.authService
      .changePassword(params as ChangePasswordPayload)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.changePasswordForm.reset();
        this.passwordFieldType = 'password';
        this.confirmPasswordFieldType = 'password';
        this.oldPasswordFieldType = 'password';
        this.toasterService.display(res.message);
      });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordFieldType =
      this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }

  toggleOldPasswordVisibility(): void {
    this.oldPasswordFieldType =
      this.oldPasswordFieldType === 'password' ? 'text' : 'password';
  }
}
