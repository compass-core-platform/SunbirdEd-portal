import { IFetchForumId } from './../../../groups/interfaces/group';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService, ResourceService, NavigationHelperService } from '../../../shared/services';
import { DiscussionTelemetryService } from '../../../shared/services/discussion-telemetry/discussion-telemetry.service';
import * as _ from 'lodash-es';
import { UserService } from '../../../core/services';
import { CsLibInitializerService } from '../../../../service/CsLibInitializer/cs-lib-initializer.service';
import { CsModule } from '@project-sunbird/client-services';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';

@Component({
  selector: 'app-access-discussion',
  templateUrl: './access-discussion.component.html',
  styleUrls: ['./access-discussion.component.scss']
})

export class AccessDiscussionComponent implements OnInit {
  // TODO : Publishing as a independent npm module by taking the below properties as input
  // icon, name, context data, output event (click)
  @Input() fetchForumIdReq: IFetchForumId;
  @Input() forumIds: Array<number>;
  @Output() routerData = new EventEmitter();
  showLoader = false;
  private discussionCsService: any;
  discussionUrl: any;
  iframeInterval: any;

  constructor(
    private resourceService: ResourceService,
    private router: Router,
    private toasterService: ToasterService,
    private discussionTelemetryService: DiscussionTelemetryService,
    private navigationHelperService: NavigationHelperService,
    private userService: UserService,
    private csLibInitializerService: CsLibInitializerService,
    public sanitizer: DomSanitizer
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
    // setTimeout(() => {
    //   this.fetchForumIds();
    // }, 1000);
  }

  ngOnChanges(changes: any) {
    if (this.fetchForumIdReq) {
      setTimeout(() => {
        this.fetchForumIds();
      }, 1000);
    }
  }
  /**
   * @description - fetch all the forumIds attached to a course/group/batch
   * @param - req as  {identifier: "" , type: ""}
   */
  fetchForumIds() {
    this.discussionCsService.getForumIds(this.fetchForumIdReq).subscribe(forumDetails => {
      console.log('Get forum:', forumDetails);
      this.forumIds = _.map(_.get(forumDetails, 'result'), 'cid');
      this.navigateToDiscussionForum();
    }, error => {
      this.toasterService.error(this.resourceService.messages.emsg.m0005);
    });
  }

  /**
   * @description - register/create the user in nodebb while navigating to discussionForum
   */
  navigateToDiscussionForum() {
    this.showLoader = true;
    const createUserReq = {
      username: _.get(this.userService.userProfile, 'userName'),
      identifier: _.get(this.userService.userProfile, 'userId'),
    };
    // this.discussionTelemetryService.contextCdata = [
    //   {
    //     id: this.fetchForumIdReq.identifier.toString(),
    //     type: this.fetchForumIdReq.type
    //   }
    // ];
    // const event = {
    //   context: {
    //     cdata: this.discussionTelemetryService.contextCdata,
    //     object: {}
    //   },
    //   edata: {
    //     pageid: 'group-details',
    //     type: 'CLICK',
    //     id: 'forum-click'
    //   },
    //   eid: 'INTERACT'
    // };
    // this.discussionTelemetryService.logTelemetryEvent(event);
    // this.navigationHelperService.setNavigationUrl({ url: this.router.url });
    this.discussionCsService.createUser(createUserReq).subscribe((response) => {
      const routerData = {
        userId: _.get(response, 'result.userId.uid'),
        forumIds: this.forumIds
      };
      this.navigateToDF(routerData.userId);
    }, (error) => {
      this.showLoader = false;
      this.toasterService.error(this.resourceService.messages.emsg.m0005);
    });
  }

  navigateToDF(userId: any) {
    // this.router.navigate(['/discussion-forum'], {
    //   queryParams: {
    //     categories: JSON.stringify({ result: [this.forumIds] }),
    //     userId: userId
    //   }
    // });
    let discussionUrl = 'https://compass-dev.tarento.com/discussion-forum?categories=' + JSON.stringify({ result: [this.forumIds] }) + '&userId=' + userId + '&sidebar=false&banner=false';
    // let discussionUrl = 'https://compass-dev.tarento.com/discussion-forum/category/6?categories=' + JSON.stringify({ result: [this.forumIds] }) + '&userId=' + userId;
    console.log('unsanitized', discussionUrl);
    this.discussionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(discussionUrl);
    console.log('sanitized', this.discussionUrl);
  }

  hideElements() {
    var myIframe: any = document.getElementById("df-iframe");
    var divElement1: any = myIframe.contentWindow.document.querySelector("compass-header");
    divElement1.style.display = "none";
    this.iframeInterval = setInterval(this.hideFooter, 1500);
  }

  hideFooter() 
  {
    var myIframe: any = document.getElementById("df-iframe");
    var divElement2: any = myIframe.contentWindow.document.querySelector("main-footer");
    if (divElement2 != undefined) {
      divElement2.style.display = "none";
      clearInterval(this.iframeInterval);
    }
  }
}
