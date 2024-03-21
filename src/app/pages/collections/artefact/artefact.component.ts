import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { DateRange } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import {
  APP,
  ARTEFACT_STATUS_OPTIONS,
  SORT_OPTIONS,
  VIEW_OPTIONS
} from '@constants/app.constants';
import { LIST_TYPE, POSITION } from '@constants/app.enums';
import { PERMISSIONS } from '@constants/permission.constant';
import { Confirm } from '@decorators/confirm.decorator';
import { HasPermissionDirective } from '@directives/has-permission.directive';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { Artefact } from '@models/artefact.model';
import { Artist } from '@models/artist.model';
import {
  ActionToolbar,
  KeyValue,
  OptionDetail,
  TableColumn
} from '@models/common.model';
import { ArtefactService } from '@services/artefact.service';
import { ArtistService } from '@services/artist.service';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { CategoryService } from '@services/category.service';
import { DialogService } from '@services/dialog.service';
import { GalleryService } from '@services/gallery.service';
import { HeadingService } from '@services/heading.service';
import { MemberService } from '@services/member.service';
import { ToasterService } from '@services/toaster.service';
import { ListSearchField, SearchField, SearchFieldType } from '@vc-libs/types';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';
import { VcSearchComponent } from '@vc-libs/vc-search/vc-search.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';
import { RejectReasonComponent } from './view/reject-reason/reject-reason.component';

const modules = [
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  NgSelectModule,
  MatPaginatorModule
];
const components = [
  VcButtonComponent,
  VcActionToolbarComponent,
  VcInputComponent,
  VcTableComponent,
  SvgIconComponent,
  VcSearchComponent,
  VcLoaderComponent
];
const directives = [HasPermissionDirective];

@Component({
  selector: 'app-artefact',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe,
    ...modules,
    ...components,
    DatePipe,
    ...directives
  ],
  templateUrl: './artefact.component.html',
  styleUrls: ['./artefact.component.scss']
})
export class ArtefactComponent implements OnInit {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  @ViewChild(MatPaginator) private matPaginator: MatPaginator;
  @Input() artistId: string;
  @Input() artist: string;
  @Input() galleryId: string;
  @Input() categoryId: string;
  @Input() headingId: string;
  #destroyRef = inject(DestroyRef);

  readonly position = POSITION;
  readonly sortOptions = SORT_OPTIONS;
  readonly listType = LIST_TYPE;
  readonly viewOptions = VIEW_OPTIONS;
  readonly permissions = PERMISSIONS;
  readonly awsUrl = environment.awsUrl;
  readonly pageSizeOptions = APP.PAGE_OPTIONS;

  columns: TableColumn[] = [
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'image',
      label: ''
    },
    {
      key: 'accessionNo',
      label: 'artefact.accessionNo'
    },
    {
      key: 'title',
      label: 'common.name'
    },
    {
      key: 'artistName',
      label: 'pageTitle.artists'
    },
    {
      key: 'categoryName',
      label: 'pageTitle.categories'
    },
    {
      key: 'headingName',
      label: 'pageTitle.headings'
    },
    {
      key: 'galleryName',
      label: 'pageTitle.gallery'
    },
    {
      key: 'status',
      label: 'artefact.mode'
    },
    {
      key: 'isActive',
      label: 'common.status'
    }
  ];
  selectedOption: (typeof VIEW_OPTIONS)[number]['value'] =
    this.viewOptions[0].value;
  artefactList = new MatTableDataSource<Artefact>();
  artefacts = [];
  totalArtefact = 0;
  paginator: PageEvent;
  sortValue = new FormControl('desc');
  searchValue: KeyValue;
  selectedList: LIST_TYPE = LIST_TYPE.ACTIVE;
  isLoading = false;
  exportLoading = false;
  artistDetail: Artist;
  loadingArtistDetail = false;
  prefillValue: KeyValue;

  private _searchFields: SearchField[] = [
    {
      key: 'searchText',
      label: 'common.name',
      type: SearchFieldType.Text
    },
    {
      key: 'artistId',
      label: 'artefact.artist',
      type: SearchFieldType.List,
      list: []
    },
    {
      key: 'categoryId',
      label: 'artefact.category',
      type: SearchFieldType.List,
      list: []
    },
    {
      key: 'headingId',
      label: 'breadcrumbs.headings',
      type: SearchFieldType.List,
      list: []
    },
    {
      key: 'galleryId',
      label: 'pageTitle.gallery',
      type: SearchFieldType.List,
      list: []
    },
    {
      key: 'status',
      label: 'artefact.mode',
      type: SearchFieldType.List,
      list: ARTEFACT_STATUS_OPTIONS
    },
    {
      key: 'dateRange',
      label: 'common.date',
      type: SearchFieldType.DateRange
    }
  ];

  constructor(
    private artefactService: ArtefactService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,
    private memberService: MemberService,
    private artistService: ArtistService,
    private categoryService: CategoryService,
    private headingService: HeadingService,
    private galleryService: GalleryService,
    private dialog: MatDialog,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute
  ) { }

  get searchFields(): SearchField[] {
    return this._searchFields.filter((field) =>
      this.artistId ? field.key !== 'artistId' : true
    );
  }

  set searchFields(fields: SearchField[]) {
    this._searchFields = fields;
  }

  ngOnInit() {
    this.getArtefact();
    this.getCategoryList();
    this.getHeadingList();
    this.getGalleryList();
    this.artistId ? this.getArtistDetail() : this.getArtistList();
  }

  emitBreadcrumbDetail(): void {
    const data = this.artistDetail;
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: `${data.salutation} ${data.firstName} ${data.lastName}`
    });
  }

  getCategoryList() {
    this.categoryService
      .getCategoryList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const index = this._searchFields.findIndex(
          (el) => el.key === 'categoryId'
        );
        this.setSearchFieldDynamicValue(index, res);
        this.searchFields = [...this._searchFields];
        this.categoryId &&
          (this.prefillValue = { key: 'categoryId', value: this.categoryId });
      });
  }

  getArtistList() {
    this.artistService
      .getArtistList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const index = this._searchFields.findIndex(
          (el) => el.key === 'artistId'
        );
        this.setSearchFieldDynamicValue(index, res);
        this.searchFields = [...this._searchFields];
        this.artist &&
          (this.prefillValue = { key: 'artistId', value: this.artist });
      });
  }

  getHeadingList() {
    this.headingService
      .getHeadingList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const index = this._searchFields.findIndex(
          (el) => el.key === 'headingId'
        );
        this.setSearchFieldDynamicValue(index, res);
        this.searchFields = [...this._searchFields];
        this.headingId &&
          (this.prefillValue = { key: 'headingId', value: this.headingId });
      });
  }

  getGalleryList() {
    this.galleryService
      .getGalleryList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const index = this._searchFields.findIndex(
          (el) => el.key === 'galleryId'
        );
        this.setSearchFieldDynamicValue(index, res);
        this.searchFields = [...this._searchFields];
        this.galleryId &&
          (this.prefillValue = { key: 'galleryId', value: this.galleryId });
      });
  }

  setSearchFieldDynamicValue(index: number, options: OptionDetail[]) {
    if (
      index !== -1 &&
      this._searchFields[index].type === SearchFieldType.List
    ) {
      (this._searchFields[index] as ListSearchField).list = options;
    }
  }

  getArtistDetail() {
    this.loadingArtistDetail = true;
    this.artistService
      .getById(this.artistId)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.loadingArtistDetail = false))
      )
      .subscribe((res) => {
        this.artistDetail = res.data;
        this.emitBreadcrumbDetail();
      });
  }

  collectParams() {
    const dateRange = this.searchValue?.dateRange as DateRange<Date>;
    const startDate = dateRange?.start ? dateRange.start.toISOString() : null;
    const endDate = dateRange?.end ? dateRange.end.toISOString() : null;
    const paginator =
      this.selectedOption === 'list'
        ? this.vcTable?.paginator
        : this.matPaginator;

    return {
      sortValue: this.sortValue.value,
      isDeleted: this.selectedList === this.listType.ARCHIVED,
      limit: paginator?.pageSize || APP.PAGE_SIZE,
      page: paginator?.pageIndex + 1 || APP.PAGE_INDEX,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(this.headingId && { headingId: JSON.stringify([this.headingId]) }),
      ...(this.galleryId && { galleryId: this.galleryId }),
      ...(this.categoryId && { categoryId: this.categoryId }),
      ...(this.artistId && { artistId: this.artistId }),
      ...(this.artist && { artistId: this.artist }),
      ...this.searchValue,
      ...(this.searchValue?.headingId && {
        headingId: JSON.stringify([this.searchValue.headingId])
      })
    };
  }

  getArtefact() {
    this.isLoading = true;
    this.artefactList = new MatTableDataSource([]);
    this.artefacts = [];
    this.artefactService
      .getArtefacts(this.collectParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((res) => {
        if (this.selectedList === this.listType.ACTIVE) {
          const permissionActions = {
            [PERMISSIONS.VIEW_ARTEFACT]: {
              label: 'common.view',
              callback: this.viewArtefact.bind(this)
            },
            [PERMISSIONS.DELETE_ARTEFACT]: {
              label: 'common.archive',
              callback: this.archiveArtefact.bind(this)
            }
          };
          const actions: ActionToolbar[] = Object.entries(permissionActions)
            .filter(([permission]) =>
              this.memberService.hasPermission(permission)
            )
            .map(([, action]) => action);
          !actions.length ? this.removeActionColumn() : this.addActionColumn();
          res.data.list.forEach((el) => (el.action = actions));
        } else {
          const permissionActions = {
            [PERMISSIONS.DELETE_ARTEFACT]: {
              label: 'common.delete',
              callback: this.deleteArtefact.bind(this)
            }
          };
          const actions: ActionToolbar[] = Object.entries(permissionActions)
            .filter(([permission]) =>
              this.memberService.hasPermission(permission)
            )
            .map(([, action]) => action);
          !actions.length ? this.removeActionColumn() : this.addActionColumn();
          res.data.list.forEach((el) => (el.action = actions));
        }
        this.artefactList = new MatTableDataSource(res.data.list);
        this.totalArtefact = res.data.total;
        this.artefacts = res.data.list;
        this.matPaginator && (this.matPaginator.length = this.totalArtefact);
        this.selectedOption === 'list' &&
          this.vcTable.updateTotalRecords(this.totalArtefact);
      });
  }

  removeActionColumn() {
    this.columns = this.columns.filter((column) => column.key !== 'action');
  }

  addActionColumn() {
    const hasActionColumn = this.columns.some(
      (column) => column.key === 'action'
    );
    !hasActionColumn &&
      this.columns.unshift({ key: 'action', label: 'common.action' });
  }

  navigateToAddArtefact() {
    this.router.navigate(['/admin/artefact/add/']);
  }

  viewArtefact(row: Artefact) {
    this.router.navigate([`/admin/artefact/view/${row._id}`]);
  }

  editArtist(_id: string) {
    this.router.navigate([`/admin/artists/${_id}`]);
  }

  @Confirm('dialog.areYouSureToDelete')
  deleteArtefact(row: Artefact) {
    this.dialogService.isLoading = true;
    this.artefactService
      .archiveArtefact(row._id, { archive: false })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.artefactList.data.findIndex(
          (user) => user._id === row._id
        );
        this.artefactList.data.splice(index, 1);
        this.artefactList = new MatTableDataSource(this.artefactList.data);
        this.vcTable.updateTotalRecords(--this.totalArtefact);
      });
  }

  @Confirm('dialog.areYouSureToArchive')
  archiveArtefact(row: Artefact) {
    this.dialogService.isLoading = true;
    this.artefactService
      .archiveArtefact(row._id, { archive: true })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.artefactList.data.findIndex(
          (user) => user._id === row._id
        );
        this.artefactList.data.splice(index, 1);
        this.artefactList = new MatTableDataSource(this.artefactList.data);
        this.vcTable.updateTotalRecords(--this.totalArtefact);
      });
  }

  onPageChanged(event: PageEvent) {
    this.paginator = event;
    this.getArtefact();
  }

  onChangeList(listType: LIST_TYPE) {
    this.selectedList = listType;
    this.getArtefact();
  }

  onSearch(value: KeyValue) {
    this.vcTable?.resetPageNumber();
    this.searchValue = value;
    this.getArtefact();
  }

  openRejectedReasons(row: Artefact) {
    this.dialog.open(RejectReasonComponent, {
      width: APP.POPUP_WIDTH,
      data: {
        id: row._id,
        name: row.title,
        type: false
      }
    });
  }

  exportData() {
    const params = this.collectParams();
    delete params.page;
    delete params.limit;

    this.exportLoading = true;
    this.artefactService
      .export(params)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.exportLoading = false))
      )
      .subscribe();
  }
}
