import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';

import { BreadCrumb, BreadcrumbDetail } from '@models/breadcrumb.model';

export const BreadcrumbResolverFn: ResolveFn<Observable<Array<BreadCrumb>>> = (
  route: ActivatedRouteSnapshot
) => {
  const breadcrumbs: Array<BreadCrumb> = buildBreadCrumb(route).reverse();
  return of(updateUrls(breadcrumbs, []).reverse());
};

function buildBreadCrumb(
  activatedRoute: ActivatedRouteSnapshot,
  breadcrumbs: Array<BreadCrumb> = []
): Array<BreadCrumb> {
  const newBreadcrumbs: Array<BreadCrumb> = [...breadcrumbs];
  if (activatedRoute?.routeConfig?.data?.breadcrumb) {
    const label = activatedRoute.routeConfig.data.breadcrumb;

    let path = '';
    for (const activeRoute of activatedRoute.url) {
      path = `${path}${activeRoute.path}/`;
    }

    const breadcrumb: BreadCrumb = {
      label,
      url: path
    };
    newBreadcrumbs.push(breadcrumb);
  }

  if (activatedRoute.parent) {
    return buildBreadCrumb(activatedRoute.parent, newBreadcrumbs);
  }

  return newBreadcrumbs;
}

function updateUrls(
  breadcrumbs: Array<BreadCrumb>,
  finalBreadCrumbs: Array<BreadCrumb>
): Array<BreadCrumb> {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return finalBreadCrumbs;
  }

  let path = 'admin/';
  for (const breadcrumb of breadcrumbs) {
    path = `${path}${breadcrumb.url}`;
  }

  const lastItem: BreadCrumb | undefined = breadcrumbs.pop();
  if (lastItem) {
    lastItem.url = path;
    finalBreadCrumbs.push(lastItem);
  }

  return updateUrls(breadcrumbs, finalBreadCrumbs);
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  public vcHeaderDataChanged = new EventEmitter<BreadcrumbDetail>();
  public toggleSidebar = new EventEmitter<boolean>();

  emitBreadcrumbsDetail(breadcrumb: BreadcrumbDetail) {
    this.vcHeaderDataChanged.emit(breadcrumb);
  }
}
