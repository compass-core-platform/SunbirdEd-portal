import { TelemetryModule } from '@sunbird/telemetry';
import { MobilePlayerRoutingModule } from './mobile-player-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@sunbird/shared';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@sunbird/core';
import { PlayerHelperModule } from '@sunbird/player-helper';
import {
  SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
  SuiProgressModule, SuiRatingModule, SuiCollapseModule
} from 'ng2-semantic-ui-v9';
import { CsModule } from '@project-sunbird/client-services';
import { CsLibInitializerService } from '../../service/CsLibInitializer/cs-lib-initializer.service';
import { NotificationModule } from '../notification/notification.module';
import { DiscussionModule } from '../discussion/discussion.module';
import { PendingchangesGuard } from '@sunbird/public';
import { GroupsModule } from '../groups';
import { CommonConsumptionModule } from 'compass-common-consumption';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';import { CertificateDirectivesModule } from 'compass-svg2pdf';
import { TimeagoModule } from "ngx-timeago";
import { EcmlHandlerComponentComponent } from './components/ecml-handler-component/ecml-handler-component.component';


export const csUserServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.userService;
};
export const csCourseServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.courseService;
};
export const csNotificationServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.notificationService;
};

export const csCertificateServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.certificateService;
};

@NgModule({
  imports: [
    CommonModule,
    TimeagoModule.forRoot(),
    SharedModule,
    SharedFeatureModule,
    SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
    SuiProgressModule, SuiRatingModule, SuiCollapseModule,
    FormsModule,
    // CourseConsumptionRoutingModule,
    MobilePlayerRoutingModule,
    CoreModule,
    TelemetryModule,
    PlayerHelperModule,
    CommonConsumptionModule,
    NotificationModule,
    DiscussionModule,
    GroupsModule,
    MatIconModule,
    MatDividerModule,
    CertificateDirectivesModule
  ],
  providers: [
    { provide: 'CS_USER_SERVICE', useFactory: csUserServiceFactory, deps: [CsLibInitializerService] },
    { provide: 'CS_COURSE_SERVICE', useFactory: csCourseServiceFactory, deps: [CsLibInitializerService] },
    {provide: 'CS_COURSE_SERVICE', useFactory: csCourseServiceFactory, deps: [CsLibInitializerService]},
    {provide: 'CS_CERTIFICATE_SERVICE', useFactory: csCertificateServiceFactory, deps: [CsLibInitializerService]},
    {provide: 'CS_NOTIFICATION_SERVICE', useFactory: csNotificationServiceFactory, deps: [CsLibInitializerService] },
    PendingchangesGuard
  ],
  declarations: [EcmlHandlerComponentComponent]
})
export class MobilePlayerModule { }

