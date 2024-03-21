import { NgClass } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Params } from '@angular/router';

import { POSITION, REGEX_TYPE } from '@constants/app.enums';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';

@Component({
  selector: 'app-vc-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VcInputComponent),
      multi: true
    }
  ],
  templateUrl: './vc-input.component.html',
  styleUrls: ['./vc-input.component.scss'],
  standalone: true,
  imports: [NgClass, FormsModule, AllowNumberOnlyDirective]
})
export class VcInputComponent implements ControlValueAccessor {
  #controlValue = '';
  #propagateChange: (_param: unknown) => void = () => {};
  #propagateTouched: (_param: unknown) => void = () => {};

  @Input() customClass: Params;
  @Input() label: string;
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input({ required: true }) name: string;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() isDisabled = false;
  @Input() readOnly = false;
  @Input() applyAllowNumberOnly = false;
  @Input() pattern: RegExp;
  @Input() regexType: REGEX_TYPE;
  @Input() position: POSITION = POSITION.LEFT;
  @Input() maxLength = undefined;

  get control(): string {
    return this.#controlValue;
  }
  set control(value: string) {
    this.#controlValue = typeof value === 'string' ? value.trim() : value;
    this.#propagateChange(this.#controlValue);
  }

  writeValue(value: string) {
    this.control = value ?? '';
  }

  registerOnChange(fn: () => void) {
    this.#propagateChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.#propagateTouched = fn;
  }

  touched($event) {
    this.#propagateTouched($event);
  }
}
