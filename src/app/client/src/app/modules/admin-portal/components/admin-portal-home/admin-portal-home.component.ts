import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '@sunbird/core'

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

  constructor(public router: Router, private userService: UserService) { 
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
  }

  mapRouteandBreadCrumb() {
    console.log("Route Name", this.routeName);
    if(this.routeName === 'course-assessment') {
      this.tabName = 'Course and Assessment';
    } else if(this.routeName == 'roles-access') {
      this.tabName = 'Roles and Access'
    } else if(this.routeName === 'competencies') {
      this.tabName = 'Competencies'
    } else {
      this.tabName = 'Notification'
    }
    this.mapBreadCrumb();
  }

  mapBreadCrumb() {
    let length = this.router.url.split('/').length;
    if(this.router.url.split('/').length > 3) {
      this.breadCrumbData.push(
        {
            "label": this.router.url.split('/')[length - 1],
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
