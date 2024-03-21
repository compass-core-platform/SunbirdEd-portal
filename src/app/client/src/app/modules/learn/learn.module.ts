import { TelemetryModule } from '@sunbird/telemetry';
import { LearnRoutingModule } from './learn-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@sunbird/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoursePageComponent } from './components';
import { CoreModule } from '@sunbird/core';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { ContentSearchModule } from '@sunbird/content-search';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

import {
  SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule, SuiProgressModule,
  SuiRatingModule, SuiCollapseModule
} from 'ng2-semantic-ui-v9';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LearnRoutingModule,
    CoreModule,
    TelemetryModule,
    SharedFeatureModule,
    ContentSearchModule,
    SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule, SuiProgressModule,
    SuiRatingModule, SuiCollapseModule, CommonConsumptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatMenuModule
  ],
  providers: [],
  declarations: [CoursePageComponent]
})
export class LearnModule { }
