import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  Router,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';

import { APP } from '@constants/app.constants';
import { BreadcrumbComponent } from '@layouts/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '@layouts/header/header.component';
import { SidebarComponent } from '@layouts/sidebar/sidebar.component';
import { BreadcrumbDetail } from '@models/breadcrumb.model';
import { BreadcrumbService } from '@services/breadcrumb.service';

const components = [SidebarComponent, BreadcrumbComponent, HeaderComponent];

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [RouterOutlet, ...components],
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  breadcrumbDetail$ = signal<BreadcrumbDetail>(undefined);

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.traverseChildRoutes(this.route.snapshot);
    this.breadcrumbService.vcHeaderDataChanged
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((result) => this.breadcrumbDetail$.set(result));
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof ActivationEnd && event.snapshot.data.breadcrumbs
        )
      )
      .subscribe((route: ActivationEnd) => {
        !this.isCustomLabelNeeded() &&
          this.breadcrumbService.emitBreadcrumbsDetail({
            breadcrumbs: route.snapshot.data.breadcrumbs
          });
      });
  }

  traverseChildRoutes(routeSnapshot: ActivatedRouteSnapshot) {
    const routeData = routeSnapshot.data;
    if (routeSnapshot.children.length) {
      routeSnapshot.children.forEach((childSnapshot) => {
        this.traverseChildRoutes(childSnapshot);
      });
    } else {
      setTimeout(() => {
        !this.isCustomLabelNeeded() &&
          this.breadcrumbService.emitBreadcrumbsDetail({
            breadcrumbs: routeData.breadcrumbs
          });
      }, APP.TIMEOUT);
    }
  }

  isCustomLabelNeeded() {
    const currentUrl = this.router.url;
    const regex = /admin\/([\w-]+)\/(?:view\/)?[0-9a-fA-F]{24}$/;

    return regex.test(currentUrl);
  }

}
