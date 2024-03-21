import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { APP, SORT_OPTIONS } from '@constants/app.constants';
import { POSITION } from '@constants/app.enums';
import { PERMISSIONS } from '@constants/permission.constant';
import { Confirm } from '@decorators/confirm.decorator';
import { HasPermissionDirective } from '@directives/has-permission.directive';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { TableColumn } from '@models/common.model';
import { Role } from '@models/role.model';
import { DialogService } from '@services/dialog.service';
import { MemberService } from '@services/member.service';
import { RoleService } from '@services/role.service';
import { ToasterService } from '@services/toaster.service';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [
  VcButtonComponent,
  VcActionToolbarComponent,
  VcInputComponent,
  VcTableComponent,
  SvgIconComponent
];
const directives = [HasPermissionDirective];

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [...modules, ...components, DatePipe, ...directives],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);
  rolesList = new MatTableDataSource<Role>();
  totalData$ = signal(0);
  columns$ = signal<TableColumn[]>([
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'name',
      label: 'common.name'
    },
    {
      key: 'createdAt',
      label: 'common.date'
    }
  ]);
  paginator: PageEvent;
  searchControl = new FormControl('');
  sortValue = new FormControl('desc');
  searchValue$ = signal<string>(null);
  isLoading$ = signal(false);

  readonly sortOptions = SORT_OPTIONS;
  readonly position = POSITION;
  readonly permissions = PERMISSIONS;

  constructor(
    private route: ActivatedRoute,
    private rolesService: RoleService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,
    private memberService: MemberService
  ) { }

  ngOnInit(): void {
    this.searchData();
    this.getRoles();
  }

  searchData(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(APP.DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((value) => this.onSearch(value));
  }

  getRoles(): void {
    const params = {
      sortValue: this.sortValue.value,
      limit: this.vcTable?.paginator?.pageSize || APP.PAGE_SIZE,
      page: this.vcTable?.paginator?.pageIndex + 1 || APP.PAGE_INDEX,
      ...(this.searchValue$() && { searchText: this.searchValue$() }),
      isDeleted: false
    };
    this.isLoading$.set(true);
    this.rolesList = new MatTableDataSource([]);
    this.rolesService
      .get(params)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading$.set(false)))
      )
      .subscribe((res) => {
        const permissionActions = [
          {
            label: 'common.edit',
            callback: this.editRole.bind(this)
          },
          {
            label: 'common.delete',
            callback: this.deleteRole.bind(this)
          }
        ];
        // const actions: ActionToolbar[] = Object.entries(permissionActions)
        //   .filter(([permission]) =>
        //     this.memberService.hasPermission(permission)
        //   )
        //   .map(([, action]) => action);
        // !actions.length &&
        //   (this.columns$.update(val => val.filter(col => col.key !== 'action')));
        // res.data.list.forEach((el) => (el.action = actions));
        res.data.list.forEach((el) => (el.action = permissionActions));

        this.rolesList = new MatTableDataSource(res.data.list);
        this.totalData$.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalData$());
      });
  }

  editRole(row: Role): void {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  deleteRole(row: Role) {
    this.dialogService.isLoading = true;
    this.rolesService
      .delete(row._id)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.rolesList.data.findIndex(
          (roles) => roles._id === row._id
        );
        this.rolesList.data.splice(index, 1);
        this.rolesList = new MatTableDataSource(this.rolesList.data);
        this.totalData$.update(value => --value);
        this.vcTable.updateTotalRecords(this.totalData$());
      });
  }

  onSearch(searchVal: string) {
    this.vcTable.resetPageNumber();
    this.searchValue$.set(searchVal.trim().length ? searchVal : '');
    this.getRoles();
  }

  onPageChanged(event: PageEvent) {
    this.paginator = event;
    this.getRoles();
  }

  navigateToAddRole() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }
}
