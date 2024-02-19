import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminPortalHomeComponent } from './components/admin-portal-home/admin-portal-home.component';
import { CourseAssessmentProgressComponent } from './components/course-assessment-progress/course-assessment-progress.component';
import { BatchProgressDetailsComponent } from './components/batch-progress-details/batch-progress-details.component';

const routes: Routes = [
  { path: '', component: AdminPortalHomeComponent,
    children:[
      { path: '', redirectTo:'course-assessment', pathMatch:'full' },
      { path: 'course-assessment', component: CourseAssessmentProgressComponent,
      // children: [
      //   { path: 'batch/:courseId/:batchId', component: BatchProgressDetailsComponent}
      // ]
      },
      { path: 'course-assessment/batch/:courseId/:batchId', component: BatchProgressDetailsComponent}
  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPortalRoutingModule { }
