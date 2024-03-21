import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractFileName',
  standalone: true
})
export class ExtractFileNamePipe implements PipeTransform {
  transform(url: string): string {
    if (!url) return '';
    return url.split('/').at(-1);
  }
}
