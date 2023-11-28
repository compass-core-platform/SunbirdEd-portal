import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompetencyPassbookComponent } from './components/competency-passbook/competency-passbook.component';

const routes: Routes = [
  { path: '', component: CompetencyPassbookComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetencyPassbookRoutingModule { }
