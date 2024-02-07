import { Component, OnInit } from '@angular/core';
import { ResourceService} from '@sunbird/shared';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  resourceService: ResourceService;
  breadCrumbData = [
    {
      "label": "Profile",
      "status": "inactive",
      "link": "profile",
      'icon': 'person'
    },
    {
      "label": "Edit profile",
      "status": "active",
      "link": "",
      'icon': 'edit'
    }
  ];

  constructor(resourceService: ResourceService) {
    this.resourceService = resourceService;
   }

  ngOnInit(): void {
  }

}
