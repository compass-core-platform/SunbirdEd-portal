import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomNotificationComponent } from './custom-notification/custom-notification.component';
import { SbNotificationsModule } from 'sb-notifications';
import { TaxonomyService } from '../../service/taxonomy.service';
import { RouterModule } from '@angular/router';
import { CustomNotificationRoutingModule } from './custom-notification-routing.module';

const environment = {
  domain:'https://compass-dev.tarento.com/',
  production: false,
  userId:'',
  authorization: '',
  framework:'fracing_fw'
};

@NgModule({
  declarations: [
    CustomNotificationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CustomNotificationRoutingModule,
    SbNotificationsModule.forRoot({
      configuration: { environment:environment }
    })
  ]
})
export class CustomNotificationModule {
  constructor(private taxonomyService: TaxonomyService ) {
    environment.userId = localStorage.getItem('userId');
    this.taxonomyService.getPortalToken().subscribe((res) => {
      environment.authorization = res; 
    });
  }
 }
