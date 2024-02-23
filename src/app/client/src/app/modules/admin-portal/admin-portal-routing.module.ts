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

const routes: Routes = [
  { path: '', component: AdminPortalHomeComponent,
    children:[
      { path: '', redirectTo:'course-assessment', pathMatch:'full' },
      { path: 'course-assessment', component: CourseAssessmentProgressComponent,
      // children: [
      //   { path: 'batch/:courseId/:batchId', component: BatchProgressDetailsComponent}
      // ]
      },
      { path: 'course-assessment/batch/:courseId/:batchId', component: BatchProgressDetailsComponent},
      { path: 'roles-access', component: UserOrgManagementComponent},
      { path: 'roles-access/userRoleAssign', component: UserRoleAssignComponent},
      { path: 'competencies', component: CompetencyPassbookComponent},
      // { path: 'custom-notification', component: CustomNotificationComponent,
      //     children:[ 
      //       { path: '', redirectTo:'list', pathMatch:'full' },
      //       {path:'list', component:NotificationListComponent}
      //   ]
      // },
      // { path: 'custom-notification', component: CustomNotificationComponent,
      //   children:[ 
      //     {path: 'create', component: CreateNotificationComponent}
      //   ]
      // }
      { path: 'custom-notification', component: NotificationListComponent},
      { path: 'custom-notification/create', component: CreateNotificationComponent}
  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPortalRoutingModule { }
