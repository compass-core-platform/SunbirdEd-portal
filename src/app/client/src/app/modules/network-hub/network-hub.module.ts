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
  translation: {}
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
    config.userDepartment = this.userProfile?.profileDetails?.employmentDetails?.departmentName;
    this.resourceService.networkhubConfig$.subscribe((newConfig) => {
      config.translation = newConfig;
    });
  }
}
