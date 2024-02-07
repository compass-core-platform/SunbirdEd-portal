import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProfileFrameworkPopupComponent, TermsAndConditionsPopupComponent,
  OtpPopupComponent, BatchInfoComponent, SsoMergeConfirmationComponent, ValidateTeacherIdentifierPopupComponent,
  UserLocationComponent, UserOnboardingComponent, OnboardingUserSelectionComponent,
  ConfirmationPopupComponent, CertPreviewPopupComponent, ContentPlayerComponent, CollectionPlayerComponent, YearOfBirthComponent
} from './components';
import { TelemetryModule } from '@sunbird/telemetry';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
  SuiProgressModule, SuiRatingModule, SuiCollapseModule, SuiDimmerModule } from 'ng2-semantic-ui-v9';
import { GlobalConsentPiiComponent } from './components/global-consent-pii/global-consent-pii.component';
import { CsModule } from '@project-sunbird/client-services';
import { CsLibInitializerService } from '../../service/CsLibInitializer/cs-lib-initializer.service';
import { PlayerHelperModule } from '@sunbird/player-helper';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { CommonFormElementsModule } from '@project-sunbird/common-form-elements-full';
import { LocationModule } from '../../plugins/location';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashletModule } from  '@project-sunbird/sb-dashlet';
import { FrameworkCatLabelTranslatePipe } from './pipe/framework-label-translate/framework-label-translate.pipe';
import { DataTableComponent } from './components/data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export const csUserServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.userService;
};
export const csNotificationServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.notificationService;
};
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule,
    TelemetryModule,
    RouterModule,
    SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
    SuiProgressModule, SuiRatingModule, SuiCollapseModule, SuiDimmerModule,
    FormsModule,
    ReactiveFormsModule,
    PlayerHelperModule,
    CommonConsumptionModule,
    CommonFormElementsModule,
    LocationModule,
    DashletModule.forRoot(),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule
  ],
  providers:  [{ provide: 'CS_USER_SERVICE', useFactory: csUserServiceFactory, deps: [CsLibInitializerService] },
  { provide: 'CS_NOTIFICATION_SERVICE', useFactory: csNotificationServiceFactory, deps: [CsLibInitializerService] }],
  declarations: [ProfileFrameworkPopupComponent, TermsAndConditionsPopupComponent,
    OtpPopupComponent, BatchInfoComponent, SsoMergeConfirmationComponent, ValidateTeacherIdentifierPopupComponent,
    UserLocationComponent,
    UserOnboardingComponent,
    OnboardingUserSelectionComponent,
    ConfirmationPopupComponent, CertPreviewPopupComponent, ContentPlayerComponent, GlobalConsentPiiComponent,
     CollectionPlayerComponent, YearOfBirthComponent, DashboardComponent,FrameworkCatLabelTranslatePipe, DataTableComponent
  ],
  exports: [ProfileFrameworkPopupComponent, TermsAndConditionsPopupComponent,
    OtpPopupComponent, BatchInfoComponent, SsoMergeConfirmationComponent, ValidateTeacherIdentifierPopupComponent,
    UserLocationComponent, UserOnboardingComponent, OnboardingUserSelectionComponent,
    ConfirmationPopupComponent, CertPreviewPopupComponent, DashboardComponent,
     ContentPlayerComponent, GlobalConsentPiiComponent, CollectionPlayerComponent, YearOfBirthComponent, DataTableComponent]
})
export class SharedFeatureModule { }