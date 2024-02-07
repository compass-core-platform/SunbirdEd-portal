import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../../core/services';
import { IUserData } from '@sunbird/shared';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../shared/services';

@Component({
  selector: 'app-competency-passbook',
  templateUrl: './competency-passbook.component.html',
  styleUrls: ['./competency-passbook.component.scss']
})
export class CompetencyPassbookComponent implements OnInit {
  public sanitizedUrl: SafeResourceUrl;

  breadCrumbData: any = [
    {
      "label": "Learn",
      "status": "inactive",
      "link": "resources",
      "icon": "school"
    },
    {
      "label": "Competency passbook",
      "status": "active",
      "link": "",
      "icon": "extension"
    }
  ];
  constructor(
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService,
    private userService: UserService,
    private router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    const url = `https://compass.samagra.io?userId=${localStorage.getItem('userId')}`;
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.checkUserProfileDetails();
  }

  checkUserProfileDetails() {
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile['profileDetails']['professionalDetails'].length > 0) {
        if (user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == null || user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == undefined || user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == '') {
          this.toasterService.warning("Please update your designation to proceed.");
          this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
        }
      } else {
        this.toasterService.warning("Please update your designation to proceed.");
        this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
      }
    });
  }

}
