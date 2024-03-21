import { FormControl } from '@angular/forms';
import { FormControlMap } from '@models/common.model';

export interface AuthPayload {
  email: string;
  password: string;
  resetPasswordToken?: string;
}

export interface MemberDetail {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[] | null;
  token: string;
  role: string;
  permissions: string[];
}

export interface ForgetPasswordForm {
  email: FormControl<string>;
}

export interface Password {
  password: string;
  confirmPassword: string;
  oldPassword: string;
}

export type ResetPasswordForm = FormControlMap<Omit<Password, 'oldPassword'>>;

export type ChangePasswordForm = FormControlMap<Password>;

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}

export type PasswordType = 'password' | 'text';
