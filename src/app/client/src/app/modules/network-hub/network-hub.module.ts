import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkHubComponent } from './network-hub/network-hub.component';
import { RouterModule } from '@angular/router';
import { NetworkHubRoutingModule } from './network-hub-routing.module';
import { NetworkService, SbNetworkHubModule, SbNetworkHubRoutingModule } from 'sb-network-hub'
import { TaxonomyService } from '../../service/taxonomy.service';

const environment = {
  domain:'https://compass-dev.tarento.com/',
  production: false,
  userId:'',
  authorization: ''
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
      configuration: { environment:environment }
    })  
  ] 
})
export class NetworkHubModule {

  constructor(private taxonomyService: TaxonomyService ) {
    environment.userId = localStorage.getItem('userId');
    this.taxonomyService.getPortalToken().subscribe((res) => {
      environment.authorization = res; 
    });
  }
}
