import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '@sunbird/core';
import { ResourceService } from '@sunbird/shared';

@Component({
  selector: 'app-admin-portal-home',
  templateUrl: './admin-portal-home.component.html',
  styleUrls: ['./admin-portal-home.component.scss']
})
export class AdminPortalHomeComponent implements OnInit {
  routeName: string = 'course-assessment';
  tabName = 'Course and Assessment';
  iconName = 'school';
  breadCrumbData = [];

  constructor(public router: Router, private userService: UserService, public resourceService: ResourceService) { 
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.routeName = this.router.url.split('/')[2];
        if(this.routeName) {
          this.mapRouteandBreadCrumb()
        }
      }
    });
  }

  ngOnInit(): void {
    this.routeName = this.router.url.split('/')[2];
    if(this.routeName) {
      this.mapRouteandBreadCrumb()
    }
  }

  mapRouteandBreadCrumb() {
    console.log("Route Name", this.routeName);
    if(this.routeName === 'course-assessment') {
      this.tabName = 'Course and Assessment';
      //change Icon as required
      this.iconName = 'school';
    } else if(this.routeName == 'roles-access') {
      this.tabName = 'Roles and Access';
      //change Icon as required
      this.iconName = 'school';
    } else if(this.routeName === 'competencies') {
      this.tabName = 'User Competency Passbook';
      //change Icon as required
      this.iconName = 'school';
    } else if(this.routeName === 'taxonomy-editor') {
      this.tabName = 'Taxonomy Editor';
      //change Icon as required
      this.iconName = 'school';
    } else {
      this.tabName = 'Notification';
      //change Icon as required
      this.iconName = "notifications";
    }
    this.mapBreadCrumb();
  }

  mapBreadCrumb() {
    let routerArray = this.router.url.split('/');
    let length = routerArray.length;
    if(routerArray.length > 3) {
      this.breadCrumbData.push(
        {
            "label": routerArray[2] == 'course-assessment'? routerArray[3] : routerArray[length - 1],
            "status": "active",
            "icon": this.iconName,
            "link": this.router.url
      });
    } else {
      this.breadCrumbData = [];
      this.breadCrumbData.push(
        {
            "label": this.tabName,
            "status": "active",
            "icon": this.iconName,
            "link": this.router.url
      });
    }
    
  }

}
