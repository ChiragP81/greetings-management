import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  forwardRef
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';

import { environment } from '@environment/environment';

declare const intlTelInput;

@Component({
  selector: 'app-vc-tel-input',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './vc-tel-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VcTelInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => VcTelInputComponent),
      multi: true
    }
  ]
})
export class VcTelInputComponent implements OnInit, AfterViewInit {
  MAX_PADDING = 100;
  PADDING_LEFT = 3.97;

  @Input() defaultCountry: string;
  @Input() public cssClass: Record<string, boolean>;
  @Input() public E164PhoneNumber: string;
  @Input() public label: string;
  @Input() public labelCssClass: string;
  @Input() public name = 'intl-tel-input-name';
  @Input() public onlyLocalized = true;
  @Input() public options = {};
  @Input() public required = false;
  @Input() public isDisabled = false;

  @Output() public blurEvent: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('intlTelInput') private _inputElement: ElementRef;

  private _intlTelInput;
  private onTouch: () => object;
  private onModelChange: (value: string) => object;
  private onValidatorChange: () => object;
  public preferredCountries: string[] = environment.preferredCountries;

  telInputControl: FormControl = new FormControl();

  private static modifyCountryData() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).intlTelInputGlobals
      ?.getCountryData()
      .forEach(
        (country) => (country.name = country.name.replace(/.+\((.+)\)/, '$1'))
      );
  }

  ngOnInit() {
    this.telInputControl.valueChanges.subscribe((result) => {
      if (!result && this.onModelChange) {
        this.onModelChange(result);
      }
      if (result && this.onModelChange) {
        this.setPhoneNumber(result);
        if (this.onTouch && !this.telInputControl.touched) {
          this.onTouch();
        }
        if (this.onValidatorChange) {
          this.onValidatorChange();
        }
      }
    });

    if (this.isDisabled) {
      this.telInputControl.disable();
    }
  }

  onClick() {
    if (this.onTouch) {
      this.onTouch();
    }
  }

  onBlur() {
    if (this.onTouch) {
      this.onTouch();
    }
    this.blurEvent.emit();
  }

  ngAfterViewInit() {
    if (this.onlyLocalized) {
      VcTelInputComponent.modifyCountryData();
    }

    this.options = {
      initialCountry: this.defaultCountry,
      separateDialCode: true,
      preferredCountries: this.preferredCountries,
      formatOnDisplay: true,
      autoHideDialCode: true,
      phoneValidation: true,
      utilsScript:
        'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.15/js/utils.js'
    };

    const intlTelInputInstance = intlTelInput;
    this._intlTelInput = intlTelInputInstance(
      this._inputElement.nativeElement,
      this.options
    );
  }

  setPhoneNumber(value: string) {
    if (this._intlTelInput) {
      if (value) {
        this._intlTelInput.setNumber(value);
      }
      this.i18nPhoneNumber();
    }
  }

  i18nPhoneNumber(): void {
    this.adjustPaddingLeftIfNeeded();
    this.updateE164PhoneNumber();
  }

  adjustPaddingLeftIfNeeded(): void {
    const paddingLeft = Number(
      this._intlTelInput.telInput.style.paddingLeft.replace('px', '')
    );
    if (paddingLeft > this.MAX_PADDING) {
      this.adjustPaddingLeft();
    }
  }

  adjustPaddingLeft(): void {
    const widthOfCountryDialCode =
      this._intlTelInput.selectedDialCode?.parentElement?.clientWidth || 0;
    this._intlTelInput.telInput.style.paddingLeft = `${
      widthOfCountryDialCode + this.PADDING_LEFT
    }px`;
  }

  updateE164PhoneNumber(): void {
    this.E164PhoneNumber = this._intlTelInput.getNumber();
    if (!this.E164PhoneNumber) {
      this.handleNoE164PhoneNumber();
    } else {
      this.onModelChange && this.onModelChange(this.E164PhoneNumber);
    }
  }

  handleNoE164PhoneNumber(): void {
    const selectedDialCode = this._intlTelInput.selectedDialCode?.innerText;
    if (selectedDialCode) {
      this.E164PhoneNumber = this.buildE164PhoneNumber(selectedDialCode);
      this.onModelChange && this.onModelChange(this.E164PhoneNumber);
    }
  }

  buildE164PhoneNumber(dialCode: string): string {
    const inputValue = this.telInputControl.value || '';
    return this.telInputControl.value && this.telInputControl.value[0] === '+'
      ? `${dialCode}${this._intlTelInput.telInput.value}`
      : `${dialCode}${inputValue}`;
  }

  registerOnChange(fn) {
    this.onModelChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouch = fn;
  }

  writeValue(obj) {
    this.telInputControl.setValue(obj);
  }

  validate(control: AbstractControl): ValidationErrors {
    if (control.value && this._intlTelInput) {
      const selectedCountryCode = this._intlTelInput.getSelectedCountryData();
      if (control.value === `+${selectedCountryCode.dialCode}`) {
        if (this.required) {
          control.setErrors({
            required: true
          });
          return control.errors;
        } else {
          control.setValue('');
        }
      } else if (
        !this._intlTelInput.isValidNumber() &&
        this._intlTelInput.isValidNumber() !== null
      ) {
        control.setErrors({
          invalidNumber: true
        });
        return control.errors;
      }
    }
    return null;
  }

  registerOnValidatorChange?(fn) {
    this.onValidatorChange = fn;
  }
}
