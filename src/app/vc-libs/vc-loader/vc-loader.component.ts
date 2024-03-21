import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vc-loader',
  standalone: true,
  imports: [NgClass],
  templateUrl: './vc-loader.component.html'
})
export class VcLoaderComponent {
  @Input() class: Record<string, boolean>;
}
