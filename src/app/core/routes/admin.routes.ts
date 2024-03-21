import { Routes } from '@angular/router';
import { PERMISSIONS } from '@constants/permission.constant';
import { PermissionGuard } from '@guards/permission.guard';

import { ArtefactData } from '@services/artefact.service';
import { BreadcrumbResolverFn } from '@services/breadcrumb.service';
import { MemberDetail } from '@services/member.service';
import { RoleDetail } from '@services/role.service';

export const adminRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        title: 'pageTitle.dashboard',
        loadComponent: () =>
          import('@pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: {
          role: 'admin',
          breadcrumb: 'dashboard'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },
  {
    path: 'member',
    data: {
      breadcrumb: 'memberList',
      permission: PERMISSIONS.VIEW_MEMBER
    },
    canMatch: [PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.members',
        loadComponent: () =>
          import('@pages/members/members.component').then(
            (m) => m.MembersComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'member.add',
        loadComponent: () =>
          import('@pages/members/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add',
          permission: PERMISSIONS.ADD_MEMBER
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        },
        canMatch: [PermissionGuard]
      },
      {
        path: ':_id',
        title: 'member.edit',
        loadComponent: () =>
          import('@pages/members/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit',
          permission: PERMISSIONS.UPDATE_MEMBER
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          memberDetail: MemberDetail
        },
        canMatch: []
      }
    ]
  },
  {
    path: 'roles',
    data: {
      breadcrumb: 'roles',
      permission: PERMISSIONS.VIEW_ROLE
    },
    canMatch: [PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.roles',
        loadComponent: () =>
          import('@pages/roles/roles.component').then((m) => m.RolesComponent),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'roles.add',
        loadComponent: () =>
          import('@pages/roles/add/add.component').then((m) => m.AddComponent),
        data: {
          breadcrumb: 'add',
          permission: PERMISSIONS.ADD_ROLE
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        },
        canMatch: [PermissionGuard]
      },
      {
        path: ':_id',
        title: 'roles.edit',
        loadComponent: () =>
          import('@pages/roles/add/add.component').then((m) => m.AddComponent),
        data: {
          breadcrumb: 'edit',
          permission: PERMISSIONS.UPDATE_ROLE
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          roleDetail: RoleDetail
        },
        canMatch: [PermissionGuard]
      }
    ]
  },
  {
    path: 'artefact',
    data: {
      breadcrumb: 'artefact',
      permission: PERMISSIONS.VIEW_ARTEFACT
    },
    canMatch: [PermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.artefact',
        loadComponent: () =>
          import('@pages/collections/artefact/artefact.component').then(
            (m) => m.ArtefactComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'artefact.add',
        loadComponent: () =>
          import('@pages/collections/artefact/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add',
          permission: PERMISSIONS.ADD_ARTEFACT
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        },
        canMatch: [PermissionGuard]
      },
      {
        path: 'view/:_id',
        title: 'artefact.view',
        loadComponent: () =>
          import('@pages/collections/artefact/view/view.component').then(
            (m) => m.ViewComponent
          ),
        data: {
          breadcrumb: 'view',
          permission: PERMISSIONS.VIEW_ARTEFACT
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          artefactDetail: ArtefactData
        },
        canMatch: [PermissionGuard]
      },
      {
        path: ':_id',
        title: 'artefact.edit',
        loadComponent: () =>
          import('@pages/collections/artefact/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit',
          permission: PERMISSIONS.UPDATE_ARTEFACT
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        },
        canMatch: [PermissionGuard]
      }
    ]
  },

  {
    path: 'profile',
    data: {
      breadcrumb: 'profile'
    },
    children: [
      {
        path: '',
        title: 'pageTitle.profile',
        loadComponent: () =>
          import('@pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },

  {
    path: 'change-password',
    data: {
      breadcrumb: 'changePassword'
    },
    children: [
      {
        path: '',
        title: 'pageTitle.changePassword',
        loadComponent: () =>
          import('@auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },

  {
    path: 'configuration',
    data: {
      breadcrumb: 'configuration'
    },
    children: [
      {
        path: '',
        title: 'pageTitle.configuration',
        loadComponent: () =>
          import('@pages/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },

];
