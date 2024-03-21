import { Pipe, PipeTransform } from '@angular/core';
import { APP } from '@constants/app.constants';

@Pipe({
  name: 'moneyFormat',
  standalone: true
})
export class MoneyFormatPipe implements PipeTransform {
  transform(value: number) {
    const precision = 2;
    return `${APP.CURRENCY_SYMBOL}${value.toFixed(precision)}`;
  }
}
