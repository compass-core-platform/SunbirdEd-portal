import { SharedFeatureModule } from '@sunbird/shared-feature';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@sunbird/shared';
import { ProfileRoutingModule } from './profile-routing.module';
import {
  ProfilePageComponent, ProfileBadgeComponent, UpdateContactDetailsComponent,
  AccountRecoveryInfoComponent, CreateUserComponent, ChooseUserComponent, SubmitTeacherDetailsComponent
} from './components';
import { SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
  SuiProgressModule, SuiRatingModule, SuiCollapseModule } from 'ng2-semantic-ui-v9';
import { CoreModule } from '@sunbird/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { WebExtensionModule } from '@project-sunbird/web-extensions';
import { TelemetryModule } from '@sunbird/telemetry';
import { ContentSearchModule } from '@sunbird/content-search';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption';
import { CertificateDirectivesModule } from 'compass-svg2pdf';
import { CsModule } from '@project-sunbird/client-services';
import { CsLibInitializerService } from '../../service/CsLibInitializer/cs-lib-initializer.service';
import { CommonFormElementsModule } from '@project-sunbird/common-form-elements-full';
import {LocationModule} from '../location';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CardModule } from 'compass-common-consumption';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { PersonalDetailsComponent } from './components/personal-details/personal-details.component';
import { MatButtonModule } from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatChipsModule} from '@angular/material/chips';
import { AcademicDetailsComponent } from './components/academic-details/academic-details.component';
import { ProfessionalDetailsComponent } from './components/professional-details/professional-details.component';
import { CertificationAndSkillsComponent } from './components/certification-and-skills/certification-and-skills.component';

export const csCourseServiceFactory = (csLibInitializerService: CsLibInitializerService) => {
  if (!CsModule.instance.isInitialised) {
    csLibInitializerService.initializeCs();
  }
  return CsModule.instance.courseService;
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
    ProfileRoutingModule,
    SharedModule,
    SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule,
    SuiProgressModule, SuiRatingModule, SuiCollapseModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    // WebExtensionModule,
    TelemetryModule,
    SharedFeatureModule,
    ContentSearchModule,
    CommonConsumptionModule,
    CertificateDirectivesModule,
    CommonFormElementsModule,
    LocationModule,
    MatTooltipModule,
    CardModule,
    SlickCarouselModule,
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
  ],
  declarations: [ProfilePageComponent, ProfileBadgeComponent, UpdateContactDetailsComponent,
   AccountRecoveryInfoComponent,
   CreateUserComponent,
   ChooseUserComponent,
   SubmitTeacherDetailsComponent,
   EditProfileComponent,
   PersonalDetailsComponent,
   AcademicDetailsComponent,
   ProfessionalDetailsComponent,
   CertificationAndSkillsComponent
   ],
  providers: [
    {provide: 'CS_COURSE_SERVICE', useFactory: csCourseServiceFactory, deps: [CsLibInitializerService]},
    {provide: 'CS_CERTIFICATE_SERVICE', useFactory: csCertificateServiceFactory, deps: [CsLibInitializerService]}
  ]
})
export class ProfileModule { }
