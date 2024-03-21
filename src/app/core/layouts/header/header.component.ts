import { Component } from '@angular/core';

import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { BreadcrumbService } from '@services/breadcrumb.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private breadcrumbService: BreadcrumbService) {}

  openSidebar() {
    this.breadcrumbService.toggleSidebar.emit(true);
  }
}
