import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
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

import { REGEX } from '@constants/app.constants';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { PasswordType, ResetPasswordForm } from '@models/auth.model';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [TranslateModule, ReactiveFormsModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  isSubmitted$ = signal(false);
  resetPasswordForm!: FormGroup<ResetPasswordForm>;
  passwordFieldType$: WritableSignal<PasswordType> = signal('password');
  confirmPasswordFieldType$: WritableSignal<PasswordType> = signal('password');

  private destroyRef = inject(DestroyRef);
  readonly logoURL = environment.logo;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private customValidatorService: CustomValidatorService
  ) { }

  get formControls(): ResetPasswordForm {
    return this.resetPasswordForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.resetPasswordForm = new FormGroup<ResetPasswordForm>(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(REGEX.PASSWORD)
        ]),
        confirmPassword: new FormControl('', [Validators.required])
      },
      this.customValidatorService.passwordMatchValidator()
    );
  }

  resetPassword(): boolean | void {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.isSubmitted$.set(true);
    const payload = {
      resetPasswordToken: this.route.snapshot.paramMap.get('token'),
      password: this.formControls.password.value
    };
    this.authService
      .setPassword(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.router.navigate(['/auth/logout']);
      });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType$.update(
      (value: PasswordType) => value === 'password' ? 'text' : 'password');
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordFieldType$.update(
      (value: PasswordType) => value === 'password' ? 'text' : 'password');

  }
}
