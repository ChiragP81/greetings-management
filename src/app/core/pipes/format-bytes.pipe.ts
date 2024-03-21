import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatBytes',
  standalone: true
})
export class FormatBytesPipe implements PipeTransform {
  transform(value: number): string {
    if (value === 0) return '0 Bytes';
    const K = 1024;
    const DECIMAL_PLACE = 2;
    const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(value) / Math.log(K));
    return `${parseFloat((value / Math.pow(K, i)).toFixed(DECIMAL_PLACE))} ${
      SIZES[i]
    }`;
  }
}
