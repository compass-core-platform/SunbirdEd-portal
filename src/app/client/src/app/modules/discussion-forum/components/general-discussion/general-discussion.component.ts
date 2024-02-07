import { IFetchForumId } from './../../../groups/interfaces/group';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService, ResourceService, NavigationHelperService } from '../../../shared/services';
import { DiscussionTelemetryService } from '../../../shared/services/discussion-telemetry/discussion-telemetry.service';
import * as _ from 'lodash-es';
import { UserService } from '../../../core/services';
import { CsLibInitializerService } from '../../../../service/CsLibInitializer/cs-lib-initializer.service';
import { CsModule } from '@project-sunbird/client-services';
import { IUserData } from '@sunbird/shared';

// import { throwError } from 'rxjs';

@Component({
  selector: 'app-general-discussion',
  templateUrl: './general-discussion.component.html',
  styleUrls: ['./general-discussion.component.scss']
})
export class GeneralDiscussionComponent implements OnInit {
  // TODO : Publishing as a independent npm module by taking the below properties as input
  // icon, name, context data, output event (click)
  @Input() fetchForumIdReq: IFetchForumId;
  @Input() forumIds: Array<number>;
  @Output() routerData = new EventEmitter();
  showLoader = false;
  private discussionCsService: any;
  userId;

  constructor(
    private resourceService: ResourceService,
    private router: Router,
    private toasterService: ToasterService,
    private discussionTelemetryService: DiscussionTelemetryService,
    private navigationHelperService: NavigationHelperService,
    private userService: UserService,
    private csLibInitializerService: CsLibInitializerService,
    public activatedRoute: ActivatedRoute
  ) {
    if (!CsModule.instance.isInitialised) {
      this.csLibInitializerService.initializeCs();
    }
    this.discussionCsService = CsModule.instance.discussionService;
  }

  /**
   * @description - It will first check for the forum IDs coming as an input param or not,
   *                If it is not coming then it will make an api call to get the forum IDs
   */
  ngOnInit() {
    this.getUserId();
    // if (!this.forumIds) {
    // this.fetchForumIds();
    // }
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

  // checkUserProfileDetails() {
  //   this.userService.userData$.subscribe((user: IUserData) => {
  //       if (user.userProfile['organisations'][0]['position'] == null || user.userProfile['organisations'][0]['position'] == undefined || user.userProfile['organisations'][0]['position'] == '') {
  //           this.toasterService.warning("Please update your designation to proceed.");
  //           // window.location.href = '/profile/edit?channel=' + this.channelId;
  //           this.router.navigate(['/profile/edit'], { queryParams: { channel: this.activatedRoute.snapshot.paramMap.get('channel') }, relativeTo: this.activatedRoute });
  //       }
  //   });
  // }

  navigateToDF() {
    this.router.navigate(['/discussion-forum'], {
      // this.router.navigate(['/discussion-forum/category/5'], {
      queryParams: {
        categories: JSON.stringify({ result: [5] }),
        userId: this.userId
      }
    });
  }

  /**
   * @description - fetch all the forumIds attached to a course/group/batch
   * @param - req as  {identifier: "" , type: ""}
   */
  // fetchForumIds() {
  //   this.fetchForumIdReq = {
  //     type: "group",
  //     identifier: ['Category Owner']
  // };
  //   this.discussionCsService.getForumIds(this.fetchForumIdReq).subscribe(forumDetails => {
  //     this.forumIds = _.map(_.get(forumDetails, 'result'), 'cid');
  //   }, error => {
  //     this.toasterService.error(this.resourceService.messages.emsg.m0005);
  //   });
  // }

  /**
   * @description - register/create the user in nodebb while navigating to discussionForum
   */

  getUserId() {
    this.showLoader = true;
    const createUserReq = {
      username: _.get(this.userService.userProfile, 'userName'),
      identifier: _.get(this.userService.userProfile, 'userId'),
    };
    this.discussionCsService.createUser(createUserReq).subscribe((response) => {
      this.userId = _.get(response, 'result.userId.uid');
      this.navigateToDF();
    }, (error) => {
      this.showLoader = false;
      this.toasterService.error(this.resourceService.messages.emsg.m0005);
    });
  }

  // navigateToDiscussionForum() {
  //   this.showLoader = true;
  //   const createUserReq = {
  //     username: _.get(this.userService.userProfile, 'userName'),
  //     identifier: _.get(this.userService.userProfile, 'userId'),
  //   };
  //   this.discussionTelemetryService.contextCdata = [
  //     {
  //       id: this.fetchForumIdReq.identifier.toString(),
  //       type: this.fetchForumIdReq.type
  //     }
  //   ];
  //   const event = {
  //     context: {
  //       cdata: this.discussionTelemetryService.contextCdata,
  //       object: {}
  //     },
  //     edata: {
  //       pageid: 'group-details',
  //       type: 'CLICK',
  //       id: 'forum-click'
  //     },
  //     eid: 'INTERACT'
  //   };
  //   this.discussionTelemetryService.logTelemetryEvent(event);
  //   this.navigationHelperService.setNavigationUrl({ url: this.router.url });
  //   this.discussionCsService.createUser(createUserReq).subscribe((response) => {
  //     const routerData = {
  //       userId: _.get(response, 'result.userId.uid'),
  //       forumIds: this.forumIds
  //     };
  //     this.routerData.emit(routerData);
  //   }, (error) => {
  //     this.showLoader = false;
  //     this.toasterService.error(this.resourceService.messages.emsg.m0005);
  //   });
  // }
}