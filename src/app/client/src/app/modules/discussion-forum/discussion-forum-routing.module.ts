import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralDiscussionComponent } from './components/general-discussion/general-discussion.component';

const routes: Routes = [
  { path: '', component: GeneralDiscussionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscussionForumRoutingModule { }
