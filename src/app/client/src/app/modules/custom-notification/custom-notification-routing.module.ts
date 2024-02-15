import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomNotificationComponent } from './custom-notification/custom-notification.component';
import { CreateNotificationComponent, NotificationListComponent } from 'sb-notifications';
const routes: Routes = [
    { 
        path:'', 
        component: CustomNotificationComponent ,
        children:[ 
            { path: '', redirectTo:'list', pathMatch:'full' },
            {path:'create', component:CreateNotificationComponent},
            {path:'list', component:NotificationListComponent}
        ]
    }
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomNotificationRoutingModule { }
