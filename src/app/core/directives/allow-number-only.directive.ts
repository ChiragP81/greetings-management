import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { REGEX } from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';

@Directive({
  selector: '[appAllowNumberOnly]',
  standalone: true
})
export class AllowNumberOnlyDirective {
  @Input() appAllowNumberOnly = false;
  regex: RegExp;
  @Input() set regexType(type: string) {
    switch (type) {
      case REGEX_TYPE.DECIMAL:
        this.regex = REGEX.DECIMAL;
        break;
      case REGEX_TYPE.INTEGER:
        this.regex = REGEX.INTEGER;
        break;
      default:
        this.regex = REGEX.DECIMAL;
        break;
    }
  }
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event']) keyPress(event: KeyboardEvent) {
    const val = this.el.nativeElement.value + event.key;
    if (this.appAllowNumberOnly) {
      if (!this.regex.test(val)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}
