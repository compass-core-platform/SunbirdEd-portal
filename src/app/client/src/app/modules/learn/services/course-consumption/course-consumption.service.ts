
import { of as observableOf, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
import { PlayerService, PermissionService, UserService, GeneraliseLabelService, CoursesService } from '@sunbird/core';
import { ServerResponse, ResourceService, ToasterService } from '@sunbird/shared';
import { CourseProgressService } from '../courseProgress/course-progress.service';
import * as _ from 'lodash-es';
import TreeModel from 'tree-model';
import { Router } from '@angular/router';
import { NavigationHelperService } from '@sunbird/shared';
import dayjs from 'dayjs';
import { CourseBatchService } from '../course-batch/course-batch.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CourseConsumptionService {

  courseHierarchy: any;
  updateContentConsumedStatus = new EventEmitter<any>();
  launchPlayer = new EventEmitter<any>();
  updateContentState = new EventEmitter<any>();
  showJoinCourseModal = new EventEmitter<any>();
  enableCourseEntrollment = new EventEmitter();
  coursePagePreviousUrl: any;
  userCreatedAnyBatch = new EventEmitter<boolean>();
  tocList: any = [];
  private batchList = [];
  completedPercentage: any = 0;
  progressdetails: any = {};
  mimeType: string = '';
  contentIds: any;
  AvgPercentage: any = 0
  courseBatchProgress = new Subject<any>();

  constructor(private playerService: PlayerService, private courseProgressService: CourseProgressService,
    private toasterService: ToasterService, private resourceService: ResourceService, private router: Router,
    private navigationHelperService: NavigationHelperService, private permissionService: PermissionService,
    private userService: UserService, public generaliselabelService: GeneraliseLabelService, private courseBatchService: CourseBatchService,
    private coursesService: CoursesService, private http: HttpClient) {
  }

  getCourseHierarchy(courseId, option: any = { params: {} }) {
    if (this.courseHierarchy && this.courseHierarchy.identifier === courseId) {
      return observableOf(this.courseHierarchy);
    } else {
      return this.playerService.getCollectionHierarchy(courseId, option).pipe(map((response: ServerResponse) => {
        this.courseHierarchy = response.result.content;
        return response.result.content;
      }));
    }
  }

  getConfigByContent(contentId, options) {
    return this.playerService.getConfigByContent(contentId, options);
  }
  getContentState(req) {
    return this.courseProgressService.getContentState(req);
  }
  updateContentsState(req) {
    return this.courseProgressService.updateContentsState(req);
  }
  parseChildren(courseHierarchy) {
    const model = new TreeModel();
    const mimeTypeCount = {};
    const treeModel: any = model.parse(courseHierarchy);
    const contentIds = [];
    treeModel.walk((node) => {
      if (node.model.mimeType !== 'application/vnd.ekstep.content-collection' && node.model.mimeType !== 'application/vnd.sunbird.question') {
        mimeTypeCount[node.model.mimeType] = mimeTypeCount[node.model.mimeType] + 1 || 1;
        contentIds.push(node.model.identifier);
      }
    });
    return contentIds;
  }

  flattenDeep(contents) {
    if (contents) {
      return contents.reduce((acc, val) => {
        if (val.children) {
          acc.push(val);
          return acc.concat(this.flattenDeep(val.children));
        } else {
          return acc.concat(val);
        }
      }, []);
    }
  }

  getRollUp(rollup) {
    const objectRollUp = {};
    if (!_.isEmpty(rollup)) {
      for (let i = 0; i < rollup.length; i++) {
        objectRollUp[`l${i + 1}`] = rollup[i];
      }
    }
    return objectRollUp;
  }

  getContentRollUp(tree, identifier) {
    const rollup = [tree.identifier];
    if (tree.identifier === identifier) {
      return rollup;
    }
    if (!tree.children || !tree.children.length) {
      return [];
    }
    let notDone = true;
    let childRollup: any;
    let index = 0;
    while (notDone && tree.children[index]) {
      childRollup = this.getContentRollUp(tree.children[index], identifier);
      if (childRollup && childRollup.length) {
        notDone = false;
      }
      index++;
    }
    if (childRollup && childRollup.length) {
      rollup.push(...childRollup);
      return rollup;
    } else {
      return [];
    }
  }
  getAllOpenBatches(contents) {
    let openBatchCount = 0;
    let enrollementEndedBatch = 0;
    _.map(_.get(contents, 'content'), content => {
      if (content.enrollmentType === 'open') {
        if ((!(content.enrollmentEndDate && dayjs(content.enrollmentEndDate).isBefore(dayjs(new Date()).format('YYYY-MM-DD'))))) {
          enrollementEndedBatch++;
          openBatchCount++;
        } else {
          openBatchCount++;
        }
      }
    });
    if (openBatchCount === 0) {
      this.enableCourseEntrollment.emit(false);
      this.toasterService.error(this.generaliselabelService.messages.emsg.m0003);
    } else {
      this.enableCourseEntrollment.emit(true);
    }
  }

  setPreviousAndNextModule(courseHierarchy: {}, collectionId: string) {
    if (_.get(courseHierarchy, 'children')) {
      let prev;
      let next;
      const children = _.get(courseHierarchy, 'children');
      const i = _.findIndex(children, (o) => o.identifier === collectionId);
      // Set next module
      if (i === 0 || i - 1 !== children.length) { next = children[i + 1]; }
      // Set prev module
      if (i > 0) { prev = children[i - 1]; }
      return { prev, next };
    }
  }

  setCoursePagePreviousUrl() {
    const urlToNavigate = this.navigationHelperService.getPreviousUrl();
    /* istanbul ignore else */
    if (urlToNavigate &&
      (urlToNavigate.url.indexOf('/enroll/batch/') < 0) &&
      (urlToNavigate.url.indexOf('/unenroll/batch/') < 0) &&
      (urlToNavigate.url.indexOf('/course/play/') < 0)) {
      this.coursePagePreviousUrl = urlToNavigate;
    }
  }

  get getCoursePagePreviousUrl() {
    return this.coursePagePreviousUrl;
  }

  canCreateBatch(courseHierarchy) {
    return (this.isTrackableCollection(courseHierarchy) && this.permissionService.checkRolesPermissions(['CONTENT_CREATOR'])
      && this.userService.userid === _.get(courseHierarchy, 'createdBy'));
  }

  canViewDashboard(courseHierarchy) {
    return (this.canCreateBatch(courseHierarchy) || this.permissionService.checkRolesPermissions(['COURSE_MENTOR']));
  }

  canAddCertificates(courseHierarchy) {
    return this.canCreateBatch(courseHierarchy) && this.isTrackableCollection(courseHierarchy) && _.lowerCase(_.get(courseHierarchy, 'credentials.enabled')) === 'yes';
  }

  isTrackableCollection(collection: { trackable?: { enabled?: string }, contentType: string }) {
    return (_.lowerCase(_.get(collection, 'trackable.enabled')) === 'yes' || _.lowerCase(_.get(collection, 'contentType')) === 'course');
  }

  emitBatchList(batches) {
    const mentorBatches = _.map(batches, batch => {
      if ((batch.createdBy === this.userService.userid) ||
        _.includes(batch.mentors, this.userService.userid)
      ) {
        return batch;
      }
    });
    const visibility: boolean = mentorBatches ? mentorBatches.length > 0 : false;
    this.userCreatedAnyBatch.emit(visibility);
  }

  getCourseContent() {
    this.tocList.length = 0;
    this.courseHierarchy.children?.forEach((resource: any) => {
      let toc = {
        header: {
          title: resource.name,
          progress: 0,
          // totalDuration:'00m'
        },
        body: []
      }
      toc.body = resource.children?.map((c: any) => {
        return {
          name: c.name,
          mimeType: c.mimeType,
          // duration:'00m',
          selectedContent: c.identifier,
          children: c,
          collectionId: c.parent
        }
      });
      this.tocList.push(toc)
    });
    return this.tocList;
  }

  attachProgresstoContent(response: any, courseType?: any) {
    if (this.tocList.length > 0) {
      this.tocList.forEach((toc: any) => {
        let count = 0;
        let courseProgress = [];
        toc.body.forEach((body: any) => {
          if (response?.length > 0) {
            response.filter((res: any) => {
              if (body.selectedContent == res.contentId) {
                // toc.header['progress-content'] = res;
                // toc.header['progress'] = res.progress;
                let bestScore = this.bestScore(res);
                if (bestScore && courseType == 'assessment') {
                  body['bestScore'] = bestScore;
                }
                ++count;
                if (body.mimeType == 'application/vnd.sunbird.questionset') {
                  courseProgress.push(res.progress);
                } else {
                  courseProgress.push(res.completionPercentage);
                }
              }
            })
          }
        })
        if (count > 0) {
          toc.header['progress'] = this.calculateProgress(toc.body.length, courseProgress);
        }
      })
    }
    console.log("updated toc list here", this.tocList);

    return this.tocList;
  }

  bestScore(response: any) {
    if (response?.bestScore && response?.bestScore?.totalMaxScore !== 0) {
      return response.bestScore?.totalScore + '/' + response.bestScore?.totalMaxScore;
    } else if (response?.bestScore && response?.bestScore?.totalMaxScore == 0) {
      let totalMaxScore = response?.score.reduce(function (a, b) {
        if (!a) {
          return b;
        }
        if (a.totalMaxScore < b.totalMaxScore) {
          return b
        }
        return a;
      }, undefined).totalMaxScore;
      return response.bestScore?.totalScore + '/' + totalMaxScore;
    }
    return null
  }

  calculateProgress(totalCount: number, allCounts: any[]) {
    if (totalCount == 0) {
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < allCounts.length; i++) {
      sum = sum + allCounts[i];
    }
    return Math.round(sum / totalCount);
  }

  calculateAvgCourseProgress(response: any) {
    let avgCourseProgress = 0;
    let totalCount = 0;
    if (this.tocList.length > 0) {
      this.tocList.forEach((toc: any) => {
        toc.body.forEach((body: any) => {
          totalCount++;
          if (response?.length > 0) {
            response.filter((res: any) => {
              if (body.selectedContent == res.contentId) {
                if (body.mimeType == 'application/vnd.sunbird.questionset' || body.mimeType == 'application/vnd.ekstep.content-collection' || body.mimeType == 'application/vnd.ekstep.ecml-archive') {
                  avgCourseProgress = avgCourseProgress + res.progress
                } else {
                  avgCourseProgress = avgCourseProgress + res.completionPercentage
                }
              }
            })
          }
        })
      })
    }
    if (totalCount == 0) {
      this.AvgPercentage = 0;
    }
    this.AvgPercentage = Math.round(avgCourseProgress / totalCount);
  }


  // getCourseContent(hierarchy?: any) {
  //   if(hierarchy) {
  //     hierarchy?.children?.forEach((resource:any) => {
  //       this.addContent(resource);
  //      });
  //   } else {
  //     this.courseHierarchy.children?.forEach((resource:any) => {
  //       this.addContent(resource);
  //      });
  //   }
  //   return this.tocList;
  // }

  // addContent(resource: any) {
  //     let toc = {
  //       header:{
  //         title:resource.name,
  //         progress:75,
  //         // totalDuration:'00m'
  //       },
  //       body: []
  //     }
  //     toc.body = resource.children?.map((c:any) => {
  //       return {
  //         name:c.name,
  //         mimeType:c.mimeType,
  //         // duration:'00m',
  //         selectedContent: c.identifier,
  //         children: c,
  //         collectionId: c.parent
  //       }
  //     });
  //     this.tocList = [];
  //     this.tocList.push(toc);
  // }

  setContentIds(ids: any) {
    this.contentIds = ids;
  }

  getContentIds() {
    return this.contentIds;
  }

  enrollToCourse(courseHierarchy) {
    const request = {
      request: {
        courseId: courseHierarchy.identifier,
        userId: this.userService.userid,
        batchId: courseHierarchy.batches[0].batchId
      }
    };
    this.courseBatchService.enrollToCourse(request)
      .subscribe((data) => {
        console.log(data);
        if (data.result.response == 'SUCCESS') {
          this.getEnrolledCourses();
        }
      }, (err) => {
        console.log(err);
      });
  }

  setBatchList(list) {
    this.batchList = list;
  }

  getBatchList() {
    return this.batchList;
  }

  isUserExistInBatch() {
    return this.batchList.includes(this.userService.userid);
  }

  getBatchId() {
    return this.courseHierarchy.batches[0].batchId;
  }

  getEnrolledCourses() {
    this.coursesService.getEnrolledCourses().subscribe((data) => {
      console.log("New enrolled data", data);
    });
  }

  getCourseRating(courseId: string) {
    return this.http.get(`api/ratings/v1/summary/${courseId}/Course`);
  }

  saveCourseRating(data: any) {
    return this.http.post(`api/ratings/v1/upsert`, data);
  }

  getCourseReviews(data: any) {
    return this.http.post(`api/ratings/v1/ratingLookUp`, data);
  }

  getCourseRatings(courseId: string) {
    return this.http.get(`api/ratings/v1/read/${courseId}/Course/${this.userService.userid}`);
  }

}
