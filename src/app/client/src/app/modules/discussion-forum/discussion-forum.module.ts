import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscussionForumRoutingModule } from './discussion-forum-routing.module';
import { GeneralDiscussionComponent } from './components/general-discussion/general-discussion.component';


@NgModule({
  declarations: [
    GeneralDiscussionComponent
  ],
  imports: [
    CommonModule,
    DiscussionForumRoutingModule
  ]
})
export class DiscussionForumModule { }
