import { Component, OnInit } from '@angular/core';
import { ResourceService} from '@sunbird/shared';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  resourceService: ResourceService;
  breadCrumbData: any;

  constructor(resourceService: ResourceService) {
    this.resourceService = resourceService;
    this.breadCrumbData = [
      {
        "label": this.resourceService.frmelmnts.breadcrumbs.profile,
        "status": "inactive",
        "link": "profile",
        'icon': 'person'
      },
      {
        "label": this.resourceService.frmelmnts.breadcrumbs.editProfile,
        "status": "active",
        "link": "",
        'icon': 'edit'
      }
    ];
   }

  ngOnInit(): void {
    
  }

}
