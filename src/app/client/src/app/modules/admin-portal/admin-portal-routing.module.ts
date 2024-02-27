import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminPortalHomeComponent } from './components/admin-portal-home/admin-portal-home.component';
import { CourseAssessmentProgressComponent } from './components/course-assessment-progress/course-assessment-progress.component';
import { BatchProgressDetailsComponent } from './components/batch-progress-details/batch-progress-details.component';
import { UserOrgManagementComponent } from './components/user-org-management/user-org-management.component';
import { UserRoleAssignComponent } from './components/user-role-assign/user-role-assign.component';
import { CompetencyPassbookComponent } from './components/competency-passbook/competency-passbook.component';
import { CustomNotificationComponent } from './components/custom-notification/custom-notification.component';
import { CreateNotificationComponent, NotificationListComponent } from 'sb-notifications';
import { AuthGuard } from '../core/guard/auth-gard.service';

const routes: Routes = [
  { path: '', component: AdminPortalHomeComponent,
  canActivateChild: [AuthGuard],
    children:[
      { path: '', redirectTo:'course-assessment', pathMatch:'full' },
      { path: 'course-assessment', component: CourseAssessmentProgressComponent, data: {roles: 'adminRole'}},
      { path: 'course-assessment/batch/:courseId/:batchId', component: BatchProgressDetailsComponent, data: {roles: 'adminRole'}},
      { path: 'roles-access', component: UserOrgManagementComponent, data: {roles: 'adminRole'}},
      { path: 'roles-access/userRoleAssign', component: UserRoleAssignComponent, data: {roles: 'adminRole'}},
      { path: 'competencies', component: CompetencyPassbookComponent, data: {roles: 'adminRole'}},
      { path: 'custom-notification', component: NotificationListComponent, data: {roles: 'adminRole'}},
      { path: 'custom-notification/create', component: CreateNotificationComponent, data: {roles: 'adminRole'}}
  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPortalRoutingModule { }
