import { Component, Input, OnInit } from '@angular/core';
import { IForumContext } from '../../../interfaces/course';
import {
  CoursesService, PermissionService, CopyContentService,
  OrgDetailsService, UserService, GeneraliseLabelService,
} from '@sunbird/core';
import _ from 'lodash';
import { combineLatest as observableCombineLatest, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscussionService } from './../../../../discussion/services/discussion/discussion.service';
import { ToasterService, ResourceService } from '@sunbird/shared';
import { IFetchForumId } from './../../../../groups/interfaces/group';

@Component({
  selector: 'course-discussion-forum',
  templateUrl: './course-discussion-forum.component.html',
  styleUrls: ['./course-discussion-forum.component.scss']
})
export class CourseDiscussionForumComponent implements OnInit {
  @Input() courseDetails: any;
  @Input() configContent: any;
  @Input() courseHierarchy: any;
  @Input() isActive: boolean;
  discussionText: string = '';
  postText: string = '';
  searchText: string = '';
  fields = ['Popular', 'Recently posted'];
  selectedField = 'Recently posted';
  writeComment = false;
  /**
 * input data for fetchforum Ids
 */
  fetchForumIdReq: IFetchForumId;
  courseId: string;
  enrolledCourse = false;
  batchId: any;
  forumIds: Array<number>;

  constructor(public router: Router, private activatedRoute: ActivatedRoute,
    private userService: UserService, public permissionService: PermissionService,
    private discussionService: DiscussionService, private toasterService: ToasterService,
    private resourceService: ResourceService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any) {
    if (this.isActive) {
      this.generateDataForDF();
    }
  }

  generateDataForDF() {
    // alert(1);
    const isCreator = this.userService.userid === _.get(this.courseDetails, 'createdBy');
    const isMentor = this.permissionService.checkRolesPermissions(['COURSE_MENTOR']);

    observableCombineLatest(this.activatedRoute.firstChild.params, this.activatedRoute.firstChild.queryParams,
      (params, queryParams) => {
        return { ...params, ...queryParams };
      }).subscribe((params) => {
        this.courseId = params.courseId;
        this.batchId = params.batchId;
      });

    if (isCreator) {
      this.fetchForumIdReq = {
        type: 'course',
        identifier: [this.courseId],
        // cid: 6
      };
    } else if (this.enrolledCourse) {
      this.fetchForumIdReq = {
        type: 'batch',
        identifier: [this.batchId],
        // cid: 6
      };
    } else if (isMentor) {
      // TODO: make getBatches() api call;
      this.fetchForumIdReq = {
        type: 'course',
        identifier: [this.courseId],
        // cid: 6
      };
    } else {
      // TODO: make getBatches() api call;
      this.fetchForumIdReq = {
        type: 'course',
        identifier: [this.courseId],
        // cid: 6
      };
    }
    this.fetchForumIds();
  }

  /**
   * @description - fetch all the forumIds attached to a course/group/batch
   * @param - req as  {identifier: "" , type: ""}
   */
  fetchForumIds() {
    this.discussionService.getForumIds(this.fetchForumIdReq).subscribe(forumDetails => {
      console.log('Get forum Lt:', forumDetails);
      this.forumIds = _.map(_.get(forumDetails, 'result'), 'cid');
      if (this.forumIds === undefined || this.forumIds === null || !this.forumIds || this.forumIds.length === 0) {
        let reqData = {
          "category": {
            "name": this.courseDetails['name'],
            "pid": "6",
            "description": "",
            "context": [
              { "type": this.fetchForumIdReq.type, "identifier": this.courseId }
            ],
            "privileges": {
            },
            "subcategories": [
            ]
          }
        };
        this.discussionService.createForum(reqData).subscribe(resp => {
          console.log('Create forum Lt:', resp);
        }, error => {
          this.toasterService.error(this.resourceService.messages.emsg.m0005);
        });
      }
    }, error => {
      this.toasterService.error(this.resourceService.messages.emsg.m0005);
    });
  }

  /**
     * @description - navigate to the DF Page when the event is emited from the access-discussion component
     * @param  {} routerData
     */
  //  assignForumData(routerData:any) {
  //   //  alert(routerData.usenavigateToDiscussionForumrId);
  //   this.router.navigate(['/discussion-forum'], {
  //     queryParams: {
  //       categories: JSON.stringify({ result: routerData.forumIds }),
  //       userId: routerData.userId
  //     }
  //   });
  // }

}
