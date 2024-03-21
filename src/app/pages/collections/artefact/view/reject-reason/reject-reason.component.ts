import { DatePipe, NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';
import { APP } from '@constants/app.constants';
import { RejectedLog } from '@models/artefact.model';
import { DialogData, TableColumn } from '@models/common.model';
import { ArtefactService } from '@services/artefact.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';

const components = [VcLoaderComponent, VcButtonComponent, VcTableComponent];
const modules = [ReactiveFormsModule, TranslateModule];

@Component({
  selector: 'app-reject-reason',
  standalone: true,
  imports: [NgClass, DatePipe, ...modules, ...components],
  templateUrl: './reject-reason.component.html'
})
export class RejectReasonComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  isSubmitted = false;
  isLoading = false;
  reasonForm: FormGroup;
  columns: TableColumn[] = [
    {
      key: 'message',
      label: 'artefact.reason',
      width: '50%'
    },
    {
      key: 'userName',
      label: 'artefact.rejectedBy'
    },
    {
      key: 'createdAt',
      label: 'common.date'
    }
  ];
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  @Output() closeDialog = new EventEmitter<string>();
  rejectedLogList = new MatTableDataSource<RejectedLog>();
  totalData = 0;
  sortValue = new FormControl('desc');
  sortKey = new FormControl('createdAt');
  paginator: PageEvent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private artefactService: ArtefactService,
    private toasterService: ToasterService,
    private dialog: MatDialog,
    private customValidatorService: CustomValidatorService
  ) {}

  ngOnInit(): void {
    this.getRejectedLogList();
    this.initializeForm();
  }

  initializeForm() {
    this.reasonForm = new FormGroup({
      reason: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ])
    });
  }

  get formControls() {
    return this.reasonForm.controls;
  }

  getRejectedLogList() {
    const params = {
      sortValue: this.sortValue.value,
      limit: this.vcTable?.paginator?.pageSize || APP.PAGE_SIZE,
      page: this.vcTable?.paginator?.pageIndex + 1 || APP.PAGE_INDEX,
      isDeleted: false,
      ...(this.sortKey.value && { sortFields: this.sortKey.value }),
      artefactId: this.data.id
    };
    this.isLoading = true;
    this.rejectedLogList = new MatTableDataSource([]);
    this.artefactService
      .getRejectedLogs(params)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.rejectedLogList = new MatTableDataSource(res.data.list);
        this.totalData = res.data.total;
        this.vcTable.updateTotalRecords(this.totalData);
      });
  }

  onPageChanged(event: PageEvent) {
    this.paginator = event;
    this.getRejectedLogList();
  }

  onSubmit() {
    this.reasonForm.markAllAsTouched();
    if (this.reasonForm.invalid) return;
    this.isSubmitted = true;
    this.artefactService
      .updateArtefactStatus(
        this.data.id,
        'rejected',
        this.formControls.reason.value.trim()
      )
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isSubmitted = false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.closeDialog.emit('rejected');
        this.dialog.closeAll();
      });
  }

  onCancel() {
    this.dialog.closeAll();
  }
}
