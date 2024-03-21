import { Directive } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  NativeDateAdapter
} from '@angular/material/core';

export class YearDateAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    return String(date.getFullYear());
  }
}

@Directive({
  selector: '[appYearDateFormat]',
  standalone: true,
  providers: [
    {
      provide: DateAdapter,
      useClass: YearDateAdapter,
      deps: [MAT_DATE_LOCALE]
    }
  ]
})
export class YearDateFormatDirective {}
