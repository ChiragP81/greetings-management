import { Component, HostBinding, Input } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgIcon } from '@models/common.model';

@Component({
  selector: 'app-vc-svg-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './vc-svg-icon.component.html',
  styleUrls: ['./vc-svg-icon.component.scss']
})
export class VcSvgIconComponent {
  @HostBinding('style.-webkit-mask-image') svgName: string;

  @Input() set svgImageData(data: SvgIcon) {
    this.svgName = data.name;
    this.matIconRegistry.addSvgIcon(
      data.name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(data.path)
    );
  }

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}
}
