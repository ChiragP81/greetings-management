import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ROUTES } from '@constants/routes.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { DashboardCounts } from '@models/dashboard.model';
import { TranslateModule } from '@ngx-translate/core';
import { MoneyFormatPipe } from '@pipes/money-format.pipe';
import { DashboardService } from '@services/dashboard.service';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    TranslateModule,
    VcLoaderComponent,
    SvgIconComponent,
    MoneyFormatPipe
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  dashboardCounts$ = signal<DashboardCounts>(undefined);
  isLoading$ = signal(false);
  #destroyRef = inject(DestroyRef);
  skeletonItems = Array;

  readonly routes = ROUTES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.loadCounts();
  }

  loadCounts() {
    this.isLoading$.set(true);
    this.dashboardService
      .getCounts()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => (this.isLoading$.set(false)))
      )
      .subscribe((res) => (this.dashboardCounts$.set(res.data)));
  }

  redirectToArtefactDetail(_id: string) {
    this.router.navigate([`/admin/artefact/view/${_id}`], {
      relativeTo: this.route
    });
  }
}
