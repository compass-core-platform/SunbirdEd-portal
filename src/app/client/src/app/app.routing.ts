import { MY_GROUPS, NOTIFICATION } from './modules/groups';
import { NgModule } from '@angular/core';
import { ErrorPageComponent } from './modules/core/components/error-page/error-page.component';
import { RouterModule, Routes } from '@angular/router';
import { MlGuard } from './modules/observation/guards';

const appRoutes: Routes = [
  {
    path: 'learn/course', loadChildren: () => import('./modules/learn/course-consumption.module').then(m => m.CourseConsumptionModule)
  },
  {
    path: 'learn', loadChildren: () => import('./modules/learn/learn.module').then(m => m.LearnModule)
  },
  {
    path: 'resources', loadChildren: () => import('./modules/resource/resource.module').then(m => m.ResourceModule)
  },
  {
    path: 'search', loadChildren: () => import('./modules/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'workspace', loadChildren: () => import('./modules/workspace/workspace.module').then(m => m.WorkspaceModule)
  },
  {
    path: 'org', loadChildren: () => import('./modules/org-management/org-management.module').then(m => m.OrgManagementModule)
  },
  {
    path: 'dashBoard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'profile', loadChildren: () => import('./plugins/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'certs', loadChildren: () => import('./modules/certificate/certificate.module').then(m => m.CertificateModule)
  },
  {
    path: 'recover', loadChildren: () => import('./modules/recover-account/recover-account.module').then(m => m.RecoverAccountModule)
  },
  {
    path: 'accountMerge', loadChildren: () => import('./modules/merge-account/merge-account.module').then(m => m.MergeAccountModule)
  },
  {
    path: 'get', loadChildren: () => import('./modules/dial-code-search/dial-code-search.module').then(m => m.DialCodeSearchModule)
  },
  {
    path: 'uci-admin', loadChildren: () => import('./modules/uci-admin/uci-admin.module').then(m => m.UciAdminModule)
  },
  {
    path: '', loadChildren: () => import('./modules/public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'discussion', loadChildren: () => import('./modules/discussion-forum/discussion-forum.module').then(m => m.DiscussionForumModule)
  },
  {
    path: 'discussion-forum', loadChildren: () => import('./modules/discussion/discussion.module').then(m => m.DiscussionModule)
  },
  {
    path: 'competency-passbook', loadChildren: () => import('./modules/competency-passbook/competency-passbook.module').then(m => m.CompetencyPassbookModule)
  },
  {
    path: MY_GROUPS, loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule)
  },
  {
    path: NOTIFICATION, loadChildren: () => import('./modules/notification/notification.module').then(m => m.NotificationModule)
  },
  {
    path: 'observation', loadChildren: () => import('./modules/observation/observation.module').then(m => m.ObservationModule), canActivate: [MlGuard]
  },
  {
    path: 'questionnaire', loadChildren: () => import('./modules/questionnaire/questionnaire.module').then(m => m.QuestionnaireModule)
  },
  {
    path: 'solution', loadChildren: () => import('./modules/report/report.module').then(m => m.ReportModule)
  },
  {
    path: 'program', loadChildren: () => import('./modules/program-dashboard/program-dashboard.module').then(m => m.programDashboardModule)
  },
  {
    path:'network-hub', loadChildren: () => import('./modules/network-hub/network-hub.module').then(m => m.NetworkHubModule)
  },
  {
    path: 'admin-portal', loadChildren: () => import('./modules/admin-portal/admin-portal.module').then(m => m.AdminPortalModule)
  },
  {
    path:'custom-notification', loadChildren: () => import('./modules/custom-notification/custom-notification.module').then(m => m.CustomNotificationModule)
  },
  {
    path: 'error', component: ErrorPageComponent
  },
  {
    path: '**', redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
