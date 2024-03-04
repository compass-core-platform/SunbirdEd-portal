import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkHubComponent } from './network-hub/network-hub.component';
import { RouterModule } from '@angular/router';
import { NetworkHubRoutingModule } from './network-hub-routing.module';
import { NetworkService, SbNetworkHubModule, SbNetworkHubRoutingModule } from 'sb-network-hub'
import { TaxonomyService } from '../../service/taxonomy.service';
import { ResourceService } from '@sunbird/shared';

const config = {
  domain:'',
  production: false,
  userId:'',
  userName:'',
  userDepartment:'',
  authorization: '',
  translation: {
    noConnectionReq:'',
    yourConnectionReq: '',
    peopleYouKnow: '',
    connection: '',
    lastAdded: '',
    sortByName: '',
    recommended: ''
  }
 };

@NgModule({
  declarations: [
    NetworkHubComponent,
  ],
  providers:[NetworkService],
  imports: [
    CommonModule,
    RouterModule,
    NetworkHubRoutingModule,
    SbNetworkHubRoutingModule,
    SbNetworkHubModule.forRoot({
      configuration: { environment:config }
    })  
  ] 
})
export class NetworkHubModule {
  userProfile = JSON.parse( localStorage.getItem('userProfile'))
  constructor(private taxonomyService: TaxonomyService, private resourceService: ResourceService ) {
    config.userId = this.userProfile.id;
    config.userName = this.userProfile.userName;
    config.userDepartment = this.userProfile.userDepartment;
    this.taxonomyService.getPortalToken().subscribe((res) => {
      config.authorization = res; 
    });
    config.translation.noConnectionReq = this.resourceService.frmelmnts.networkHub.noConnectionReq;
    config.translation.yourConnectionReq = this.resourceService.frmelmnts.networkHub.yourConnectionReq;
    config.translation.peopleYouKnow = this.resourceService.frmelmnts.networkHub.peopleYouKnow;
    config.translation.connection = this.resourceService.frmelmnts.networkHub.connection;
    config.translation.lastAdded = this.resourceService.frmelmnts.networkHub.lastAdded;
    config.translation.sortByName = this.resourceService.frmelmnts.networkHub.sortByName;
    config.translation.recommended = this.resourceService.frmelmnts.networkHub.recommended;
  }
}
