import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { environment } from '@environment/environment';
import { AuthPayload, ForgetPasswordForm } from '@models/auth.model';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { VcButtonComponent } from 'app/vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from 'app/vc-libs/vc-input/vc-input.component';

const modules = [TranslateModule, ReactiveFormsModule];
const components = [VcButtonComponent, VcInputComponent];

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgClass, ...modules, ...components],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  isSubmitted$ = signal(false);
  fpForm: FormGroup<ForgetPasswordForm>;

  readonly logoURL = environment.logo;
  readonly emailRegex = REGEX.EMAIL;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {
    this.fpForm = new FormGroup<ForgetPasswordForm>({
      email: new FormControl('')
    });
  }

  get formControls() {
    return this.fpForm.controls;
  }

  submitForm(): boolean | void {
    this.fpForm.markAllAsTouched();
    if (this.fpForm.invalid) {
      return;
    }

    this.isSubmitted$.set(true);
    this.authService
      .forgotPassword(this.fpForm.value as Pick<AuthPayload, 'email'>)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.router.navigate(['/auth/login']);
      });
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
