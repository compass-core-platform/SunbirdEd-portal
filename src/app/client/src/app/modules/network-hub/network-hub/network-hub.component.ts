import { Component, OnInit } from '@angular/core';
import { ResourceService } from '@sunbird/shared';

@Component({
  selector: 'app-network-hub',
  templateUrl: './network-hub.component.html',
  styleUrls: ['./network-hub.component.scss']
})
export class NetworkHubComponent implements OnInit {

  constructor(public resourceService:ResourceService ) { }

  ngOnInit(): void {
  }

}
