import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { APP } from '@constants/app.constants';
import { TableColumn } from '@models/common.model';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';

const modules = [MatTableModule, TranslateModule, MatPaginatorModule];
const components = [VcLoaderComponent, VcActionToolbarComponent];

@Component({
  selector: 'app-vc-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass,
    ...modules,
    ...components,
    CdkDrag,
    CdkDropList
  ],
  templateUrl: './vc-table.component.html',
  styleUrls: ['./vc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VcTableComponent {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  @Input({ required: true }) data: MatTableDataSource<unknown, MatPaginator>;
  @Input({ required: true }) name: string = '';
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) totalData: number = 0;
  @Input() requiredPagination = true;
  @Input() isLoading: boolean = false;
  @Input() dynamicColumnSlots: Record<string, TemplateRef<unknown>> = {};
  @Input() tableWidth: string = '';
  @Input() unReadFeature = false;
  @Input() cdkDragDisabled = true;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() dropRecord = new EventEmitter<CdkDragDrop<unknown[]>>();

  readonly pageSizeOptions = APP.PAGE_OPTIONS;

  get columnKeys(): string[] {
    return this.columns.map((c) => c.key);
  }

  emitPage(e: PageEvent) {
    this.pageChanged.emit(e);
  }

  isColumnDynamicSlot(column: string): boolean {
    return !!this.dynamicColumnSlots[column];
  }

  resetPageNumber() {
    this.paginator.pageIndex = 0;
  }

  updateTotalRecords(len: number) {
    this.paginator.length = len;
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    this.dropRecord.emit(event);
  }
}
