import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@sunbird/shared';
import { CompetencyPassbookRoutingModule } from './competency-passbook-routing.module';
import { CompetencyPassbookComponent } from './components/competency-passbook/competency-passbook.component';


@NgModule({
  declarations: [
    CompetencyPassbookComponent
  ],
  imports: [
    CommonModule,
    CompetencyPassbookRoutingModule,
    SharedModule
  ]
})
export class CompetencyPassbookModule { }
