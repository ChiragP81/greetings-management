import { Component, Input } from '@angular/core';

import { SVG_ICONS } from '@constants/svg-icon.constants';
import { SvgIcon } from '@models/common.model';
import { VcSvgIconComponent } from '@vc-libs/vc-svg-icon/vc-svg-icon.component';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [VcSvgIconComponent],
  templateUrl: './svg-icon.component.html'
})
export class SvgIconComponent {
  private readonly assetSvgIcon = SVG_ICONS;

  @Input({ required: true }) set name(
    iconName: (typeof SVG_ICONS)[number]['name']
  ) {
    this.iconSvg = this.assetSvgIcon.find((i) => i.name === iconName);
  }

  iconSvg: SvgIcon;
}
