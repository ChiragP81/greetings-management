import { inject } from '@angular/core';
import { CanMatchFn, Route, Router } from '@angular/router';
import { TOASTER_TYPE } from '@constants/app.enums';
import { ToasterService } from '@services/toaster.service';

import { MemberService } from '@services/member.service';

export const PermissionGuard: CanMatchFn = (route: Route) => {
  const memberService = inject(MemberService);
  const router = inject(Router);
  const toasterService = inject(ToasterService);
  const name = route.data.permission;
  return true;
  // if (memberService.hasPermission(name)) {
  // }
  toasterService.displayTranslation(
    'validation.invalidPermission',
    TOASTER_TYPE.ERROR,
    { name }
  );
  router.navigate(['/']);
  return false;
};
