import { NgClass } from '@angular/common';
import { Component, DestroyRef, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { STORAGE } from '@constants/storage.constant';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { PasswordType } from '@models/auth.model';
import { AuthService } from '@services/auth.service';
import { MemberService } from '@services/member.service';
import { StorageService } from '@services/storage.service';
import { ToasterService } from '@services/toaster.service';
import { VcButtonComponent } from 'app/vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from 'app/vc-libs/vc-input/vc-input.component';

const modules = [FormsModule, TranslateModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, ...modules, ...components],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  isSubmitted$ = signal(false);
  passwordFieldType$: WritableSignal<PasswordType> = signal('password');
  private destroyRef = inject(DestroyRef);
  readonly logoURL = environment.logo;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private memberService: MemberService
  ) { }

  onSubmit(loginForm: NgForm): boolean | void {
    if (loginForm.invalid) {
      return;
    }
    this.isSubmitted$.set(true);
    this.authService
      .login(loginForm.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSubmitted$.set(false)))
      )
      .subscribe((res) => {
        this.storageService.set(STORAGE.LOGIN_TOKEN, res.data.token);
        this.storageService.set(STORAGE.USER_ROLES, res.data.role);
        this.storageService.set(STORAGE.USER_DATA, res.data);
        this.storageService.set(STORAGE.MY_PERMISSIONS, res.data.permissions);
        this.storageService.set(
          STORAGE.FULL_NAME,
          `${res.data.firstName} ${res.data.lastName}`
        );
        this.memberService.permissions = res.data.permissions;
        this.router.navigate(['/admin']).then(() => {
          this.toasterService.display(res.message);
        });
      });
  }

  navigateToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType$.update(
      (value: PasswordType) => value === 'password' ? 'text' : 'password');
  }
}
