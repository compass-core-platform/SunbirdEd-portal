import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPortalRoutingModule } from './admin-portal-routing.module';
import { AdminPortalHomeComponent } from './components/admin-portal-home/admin-portal-home.component';
import { CourseAssessmentProgressComponent } from './components/course-assessment-progress/course-assessment-progress.component'
import { SharedModule } from '@sunbird/shared';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BatchProgressDetailsComponent } from './components/batch-progress-details/batch-progress-details.component';
import { UserOrgManagementComponent } from './components/user-org-management/user-org-management.component';
import { UserRoleAssignComponent } from './components/user-role-assign/user-role-assign.component';
import { ManageService } from './services/manage/manage.service';
import { TelemetryModule } from '@sunbird/telemetry';

@NgModule({
  declarations: [
    AdminPortalHomeComponent,
    CourseAssessmentProgressComponent,
    BatchProgressDetailsComponent,
    UserOrgManagementComponent,
    UserRoleAssignComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminPortalRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    SharedFeatureModule,
    FormsModule,
    ReactiveFormsModule,
    TelemetryModule
  ],
  providers: [
    ManageService
  ]
})
export class AdminPortalModule { }
