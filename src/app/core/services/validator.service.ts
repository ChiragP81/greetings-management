import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorService {
  passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password: string = group.get('password')?.value;
      const confirmPassword: string = group.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  startTimeEndTimeValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const startTime = controls.get('startTime');
      const endTime = controls.get('endTime');
      if (startTime.value !== null && endTime.value !== null) {
        startTime.setErrors(null);
        endTime.setErrors(null);
        if (startTime.value === '' && endTime.value) {
          startTime.setErrors({ incorrect: true });
        } else if (startTime.value >= endTime.value) {
          endTime.setErrors({ incorrect: true });
        } else {
          return null;
        }
      }
    };
  }

  notWhitespace(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value.trim().length === 0
      ? { required: true }
      : null;
  }
}
