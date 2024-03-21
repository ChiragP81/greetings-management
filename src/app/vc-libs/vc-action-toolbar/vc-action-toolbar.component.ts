import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ActionToolbar } from '@models/common.model';

const modules = [MatButtonModule, MatMenuModule, TranslateModule];

@Component({
  selector: 'app-vc-action-toolbar',
  standalone: true,
  imports: [...modules, SvgIconComponent],
  templateUrl: './vc-action-toolbar.component.html',
  styleUrls: ['./vc-action-toolbar.component.scss']
})
export class VcActionToolbarComponent {
  @Input() actionData: ActionToolbar[];
  @Input() rowReference: unknown;
}
