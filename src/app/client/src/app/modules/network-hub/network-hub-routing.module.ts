import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworkHubComponent } from './network-hub/network-hub.component';
import { ConnectionRequestsComponent, NetworkHomeComponent, RecommendedConnectionsComponent, YourConnectionsComponent } from 'sb-network-hub';
import { AuthGuard } from '@sunbird/core';


const routes: Routes = [
    { 
        path:'', 
        component: NetworkHubComponent,
        children:[ 
            { path: '', redirectTo:'home', pathMatch:'full' },
            { path:'home', component: NetworkHomeComponent },
            { path:'connection-requst', component:ConnectionRequestsComponent },
            { path:'recommended-connection', component:RecommendedConnectionsComponent },
            { path:'your-connection', component:YourConnectionsComponent },
            
        ]
    }
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetworkHubRoutingModule { }
