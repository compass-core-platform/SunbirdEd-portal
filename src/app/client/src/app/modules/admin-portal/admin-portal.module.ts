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
import { CompetencyPassbookComponent } from './components/competency-passbook/competency-passbook.component';
import { BatchParticipantService } from './services/course-batch/batch.service';
import { CustomNotificationComponent } from './components/custom-notification/custom-notification.component';
import { SbNotificationsModule } from 'sb-notifications';
import { TaxonomyService } from './services/taxonomy/taxonomy.service';
import { TaxonomyViewWrapComponent } from './components/taxonomy-view-wrap/taxonomy-view-wrap.component';
import { SbTaxonomyEditorModule } from 'sb-taxonomy-editor';


const environment = {
  domain:'https://compass-dev.tarento.com/',
  production: false,
  userId:'',
  authorization: '',
  framework:'fracing_fw'
};


@NgModule({
  declarations: [
    AdminPortalHomeComponent,
    CourseAssessmentProgressComponent,
    BatchProgressDetailsComponent,
    UserOrgManagementComponent,
    UserRoleAssignComponent,
    CompetencyPassbookComponent,
    CustomNotificationComponent,
    TaxonomyViewWrapComponent
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
    TelemetryModule,
    SbTaxonomyEditorModule,
    SbNotificationsModule.forRoot({
      configuration: { environment:environment }
    })
  ],
  providers: [
    ManageService,
    BatchParticipantService
  ]
})
export class AdminPortalModule { 
  constructor(private taxonomyService: TaxonomyService ) {
    environment.userId = localStorage.getItem('userId');
    this.taxonomyService.getPortalToken().subscribe((res) => {
      environment.authorization = res; 
    });
  }
}
