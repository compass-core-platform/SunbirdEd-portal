import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '@sunbird/core'

@Component({
  selector: 'app-admin-portal-home',
  templateUrl: './admin-portal-home.component.html',
  styleUrls: ['./admin-portal-home.component.scss']
})
export class AdminPortalHomeComponent implements OnInit {
  tabName: string = 'course-assessment'

  constructor(private router: Router, private userService: UserService) { 
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tabName = this.router.url.split('/')[2];
        console.log("Tab Name", this.tabName);
      }
    });
  }

  ngOnInit(): void {
  }

}
