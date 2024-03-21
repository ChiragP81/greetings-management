export interface BreadCrumb {
  label: string;
  url: string;
}

export interface BreadcrumbDetail {
  breadcrumbs: BreadCrumb[];
  showLastItemCustomLabel?: boolean;
  customItemLabel?: string;
  showSecondItemCustomLabel?: boolean;
  customSecondItemLabel?: string;
  showThirdItemCustomLabel?: boolean;
  customThirdItemLabel?: string;
}
