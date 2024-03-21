import {
  DatePipe,
  KeyValuePipe,
  NgClass,
  TitleCasePipe
} from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { APP, ARTEFACT_STATUS_OPTIONS } from '@constants/app.constants';
import { PERMISSIONS } from '@constants/permission.constant';
import { HasPermissionDirective } from '@directives/has-permission.directive';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ArtefactDetail } from '@models/artefact.model';
import { APIResponseModel } from '@models/common.model';
import { ArtefactService } from '@services/artefact.service';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { ToasterService } from '@services/toaster.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';
import { RejectReasonComponent } from './reject-reason/reject-reason.component';

const modules = [
  TranslateModule,
  NgSelectModule,
  FormsModule,
  MatSlideToggleModule
];
const components = [VcButtonComponent, SvgIconComponent, VcInputComponent];
const directives = [HasPermissionDirective];
const pipes = [DatePipe, KeyValuePipe, TitleCasePipe];

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NgClass, ...pipes, ...modules, ...components, ...directives],
  templateUrl: './view.component.html'
})
export class ViewComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  originalStatus: string;
  accessionNo: string;
  isUpdate = false;
  isLoading = false;
  @Input() _id: string;
  @Input() artefactDetail: APIResponseModel<ArtefactDetail>;

  readonly statusOptions = ARTEFACT_STATUS_OPTIONS;
  readonly permissions = PERMISSIONS;
  readonly awsUrl = environment.awsUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private artefactService: ArtefactService,
    private toasterService: ToasterService,
    private breadcrumbService: BreadcrumbService,
    private dialog: MatDialog
  ) {}

  get hasMetadata() {
    return this.artefactDetail.data.metaData.some((item) => item.value);
  }

  get isPredefinedFieldVisibleOnWebsite(): (key: string) => boolean {
    return (key: string) => {
      const previewFields = this.artefactDetail.data.previewFields;
      if (previewFields && 'predefined' in previewFields) {
        return previewFields.predefined.includes(key);
      }
    };
  }

  get isMetaDataFieldVisibleOnWebsite(): (key: string) => boolean {
    return (key: string) => {
      const previewFields = this.artefactDetail.data.previewFields;
      if (previewFields && 'metaData' in previewFields) {
        return previewFields.metaData.includes(key);
      }
    };
  }

  ngOnInit(): void {
    this.originalStatus = this.artefactDetail.data.status;
    this.accessionNo = this.artefactDetail.data.accessionNo;
    this.emitBreadcrumbDetail();
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.artefactDetail.data.title
    });
  }

  updateStatus(selectedStatus: string) {
    if (selectedStatus === 'rejected') {
      const dialogRef = this.dialog.open(RejectReasonComponent, {
        width: APP.POPUP_WIDTH,
        data: {
          id: this._id,
          name: this.artefactDetail.data.title,
          type: true
        }
      });
      dialogRef.afterClosed().subscribe(() => {
        this.artefactDetail.data.status = this.originalStatus;
      });
      dialogRef.componentInstance.closeDialog.subscribe((result) => {
        if (result === 'rejected') {
          this.artefactDetail.data.status = 'rejected';
          this.originalStatus = 'rejected';
        }
      });
    } else {
      this.originalStatus = selectedStatus;
      this.artefactService
        .updateArtefactStatus(this._id, this.artefactDetail.data.status)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe((res) => this.toasterService.display(res.message));
    }
  }

  updateActiveStatus() {
    this.artefactService
      .updateArtefactActive(this._id, this.artefactDetail.data.isActive)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => this.toasterService.display(res.message));
  }

  editArtefact() {
    this.router.navigate([`../../${this._id}`], { relativeTo: this.route });
  }

  openRejectedReasons() {
    this.dialog.open(RejectReasonComponent, {
      width: APP.POPUP_WIDTH,
      data: {
        id: this._id,
        name: this.artefactDetail.data.title,
        type: false
      }
    });
  }

  updateAccessionNumber() {
    this.isLoading = true;
    const accessionNo = this.artefactDetail.data.accessionNo;
    this.artefactService
      .updateAccessionNumber(this._id, { accessionNo })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        this.closeUpdateMode();
        this.artefactDetail.data.status = 'pending';
        this.accessionNo = accessionNo;
        this.toasterService.display(res.message);
      });
  }

  onCancel() {
    this.artefactDetail.data.accessionNo = this.accessionNo;
    this.closeUpdateMode();
  }

  closeUpdateMode() {
    this.isUpdate = false;
  }
}
