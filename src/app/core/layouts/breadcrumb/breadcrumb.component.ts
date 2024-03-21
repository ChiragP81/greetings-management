import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbDetail } from '@models/breadcrumb.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent {
  @Input() breadcrumbDetail: BreadcrumbDetail;
}
