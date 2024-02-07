import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import {
  ConfigService,
} from '../../services/config/config.service';
import {
  PermissionService,
} from '../../../core/services/permission/permission.service';
import {
  ResourceService
} from '../../services/resource/resource.service';

import { Router } from '@angular/router';
@Component({
  selector: 'app-mega-menu',
  encapsulation:ViewEncapsulation.Emulated,
  templateUrl: './mega-menu.component.html',
  styleUrls: ['./mega-menu.component.scss']
})
export class MegaMenuComponent implements OnInit {

  @Output() navigateToHome = new EventEmitter();

  workSpaceRole: Array<string>;
  orgAdminRole:  Array<string>;
  adminDashboard:  Array<string>;

  constructor(private config: ConfigService, public permissionService: PermissionService,
    public resourceService: ResourceService, private router: Router) { 
    this.workSpaceRole = this.config.rolesConfig.headerDropdownRoles.workSpaceRole;
    this.orgAdminRole = this.config.rolesConfig.headerDropdownRoles.orgAdminRole;
    this.adminDashboard = this.config.rolesConfig.headerDropdownRoles.adminDashboard;
  }

  ngOnInit(): void {
    //  this.permissionService.checkRolesPermissions(this.config.rolesConfig.headerDropdownRoles.workSpaceRole);
  }

  navigateToHomepage() {
    this.navigateToHome.emit('');
  }
  
  navigateToWorkspace() {
    const authroles = this.permissionService.getWorkspaceAuthRoles();
    if (authroles) {
      this.router.navigate([authroles.url]);
    }
  }

  navigateTo(path){
      this.router.navigate([path]);
      const elem:any = document.getElementsByClassName('mat-menu-trigger menu-trigger');
      elem[0].click();
  }
  
}
