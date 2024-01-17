import { of as observableOf, Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService, ServerResponse, ToasterService, ResourceService } from '@sunbird/shared';
import { ContentService, UserService, CoursesService } from '@sunbird/core';
import * as _ from 'lodash-es';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class CourseProgressService {
  /**
 * Reference of content service.
 */
  public contentService: ContentService;

  /**
   * Reference of config service
   */
  public configService: ConfigService;

  public courseProgress: any = {};

  public userService: UserService;
  completionPercentage: any = 0;
  progressdetails: any = {};
  mimeType: string = '';
  contentProgress: any = {};
  lastReadContentId = new BehaviorSubject<any>('');
  resultMessage: string;

  private courseStatus$ = new BehaviorSubject<Number>(0);
  courseStatus = this.courseStatus$.asObservable();
  /**
  * An event emitter to emit course progress data from a service.
  */
  courseProgressData: EventEmitter<any> = new EventEmitter();


  constructor(contentService: ContentService, configService: ConfigService,
    userService: UserService, public coursesService: CoursesService, private toasterService: ToasterService,
    private resourceService: ResourceService) {
    this.contentService = contentService;
    this.configService = configService;
    this.userService = userService;
  }

  /**
  * method to get content status
  */
  public getContentState(req) {
    const courseId_batchId = req.courseId + '_' + req.batchId;
      const channelOptions = {
        url: this.configService.urlConFig.URLS.COURSE.USER_CONTENT_STATE_READ,
        data: {
          request: {
            userId: req.userId,
            courseId: req.courseId,
            contentIds: req.contentIds,
            batchId: req.batchId
          }
        }
      };
      if (_.get(req, 'fields')) {
        channelOptions.data.request['fields'] = _.get(req, 'fields');
      }
      return this.contentService.post(channelOptions).pipe(map((res: ServerResponse) => {
        this.processContent(req, res, courseId_batchId);
        this.courseProgressData.emit(this.courseProgress[courseId_batchId]);
        return this.courseProgress[courseId_batchId];
      }), catchError((err) => {
        this.courseProgressData.emit({ lastPlayedContentId: req.contentIds[0] });
        return err;
      }));
  }

  public getContentProgressState(req, res) {
    const courseId_batchId = req.courseId + '_' + req.batchId;
    this.processContent(req, res, courseId_batchId, true);
    this.courseProgressData.emit(this.courseProgress[courseId_batchId]);
    return this.courseProgress[courseId_batchId];
  }

  private processContent(req, res, courseId_batchId, isCSLResponse: boolean = false) {
    let _contentList = _.get(res, 'result.contentList');
    if (isCSLResponse) {
      _contentList = res;
    }
    this.courseProgress[courseId_batchId] = {
      progress: 0,
      completedCount: 0,
      totalCount: _.uniq(req.contentIds).length,
      content: []
    };
    const resContentIds = [];
    if (_contentList.length > 0) {
      _.forEach(_.uniq(req.contentIds), (contentId) => {
        const content = _.find(_contentList, { 'contentId': contentId });
        if (content) {
          this.courseProgress[courseId_batchId].content.push(content);
          resContentIds.push(content.contentId);
        } else {
          this.courseProgress[courseId_batchId].content.push({
            'contentId': contentId,
            'status': 0,
            'courseId': req.courseId,
            'batchId': req.batchId,
          });
        }
      });
      this.calculateProgress(courseId_batchId);
    } else {
      _.forEach(req.contentIds, (value, key) => {
        this.courseProgress[courseId_batchId].content.push({
          'contentId': value,
          'status': 0,
          'courseId': req.courseId,
          'batchId': req.batchId,
        });
      });
      this.courseProgress[courseId_batchId].lastPlayedContentId = req.contentIds[0];
    }
  }

  private calculateProgress(courseId_batchId) {
    const lastAccessTimeOfContentId = [];
    let completedCount = 0;
    const contentList = this.courseProgress[courseId_batchId].content;
    _.forEach(contentList, (content) => {
      if (content.status === 2) {
        completedCount += 1;
      }
      if (content.lastAccessTime) {
        lastAccessTimeOfContentId.push(content.lastAccessTime);
      }
    });
    this.courseProgress[courseId_batchId].completedCount = completedCount;
    const progress = ((this.courseProgress[courseId_batchId].completedCount / this.courseProgress[courseId_batchId].totalCount) * 100);
    this.courseProgress[courseId_batchId].progress = progress > 100 ? 100 : progress;
    const index = _.findIndex(contentList, { lastAccessTime: lastAccessTimeOfContentId.sort().reverse()[0] });
    const lastPlayedContent = contentList[index] ? contentList[index] : contentList[0];
    this.courseProgress[courseId_batchId].lastPlayedContentId = lastPlayedContent && lastPlayedContent.contentId;
  }

  public updateContentsState(req) {
    const courseId_batchId = req.courseId + '_' + req.batchId;
    const courseProgress = this.courseProgress[courseId_batchId];
    if (courseProgress && req.contentId && req.status) {
      const index = _.findIndex(courseProgress.content, { 'contentId': req.contentId });
      if (index !== -1 && req.status >= courseProgress.content[index].status
        && courseProgress.content[index].status !== 2) {
        courseProgress.content[index].status = req.status;
        return this.updateContentStateToServer(courseProgress.content[index]).pipe(
          map((res: any) => {
            this.courseProgress[courseId_batchId].content[index].status = req.status;
            this.courseProgress[courseId_batchId].content[index].lastAccessTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ');
            this.calculateProgress(courseId_batchId);
            this.courseProgressData.emit(this.courseProgress[courseId_batchId]);
            this.coursesService.updateCourseProgress(req.courseId, req.batchId, this.courseProgress[courseId_batchId].completedCount);
            return this.courseProgress[courseId_batchId];
          }));
      } else if(index !== -1 && courseProgress.content[index].status == 2 && this.mimeType !== 'application/vnd.sunbird.questionset') {
        return this.updateContentStateToServer(courseProgress.content[index]).pipe(map((res: any) => {
          this.courseProgress[courseId_batchId].content[index].lastAccessTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ');
        }))
      } else {
        return observableOf(this.courseProgress[courseId_batchId]);
      }
    } else {
      return observableOf(this.courseProgress[courseId_batchId]);
    }
  }
  /**
   * to make api call to server
   */
  updateContentStateToServer(data) {
    let req;
    if(this.mimeType !== 'application/vnd.sunbird.questionset') {
      //Modify below condition if progress details available for youtube or scorm content
      if(this.mimeType == 'application/vnd.ekstep.content-collection' || this.mimeType == 'application/vnd.ekstep.ecml-archive') {
        this.progressdetails = {}
      }
      if(data.status == 2) {
        req = {
          contentId: data.contentId,
          batchId: data.batchId,
          status: 2,
          courseId: data.courseId,
          lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ')
        };
        req['completionPercentage'] = 100;
        req['progressdetails'] = this.progressdetails;
        req['progress'] = 100;
      } else {
        req = {
          contentId: data.contentId,
          batchId: data.batchId,
          status: data.status,
          courseId: data.courseId,
          lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ')
        };
        req['completionPercentage'] = this.completionPercentage;
        req['progressdetails'] = this.progressdetails;
        req['progress'] = this.completionPercentage;
      }
    } else {
      req = {
        contentId: data.contentId,
        batchId: data.batchId,
        status: 1,
        courseId: data.courseId,
        lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ')
      };
    }
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.USER_CONTENT_STATE_UPDATE,
      data: {
        request: {
          userId: this.userService.userid,
          contents: [req]
        }
      }
    };
    return this.contentService.patch(channelOptions)
      .pipe(map((updateCourseStatesData: any) => ({ updateCourseStatesData })));
  }

  statusCompletion(res: any, userId: any) {
    const methodType = 'PATCH';
    const requestBody = {
        "request": {
            "userId": userId,
            "contents": [
                {
                    "contentId": res.contentId,
                    "batchId": res.batchId,
                    "status": 2,
                    "courseId": res.courseId
                }
            ],
            // "assessments": [
            //     {
            //         "assessmentTs": assessmentTs,
            //         "batchId": res.batchId,
            //         "courseId": res.courseId,
            //         "userId": userId,
            //         "attemptId": attemptID,
            //         "contentId": res.contentId,
            //         "events": []
            //     }
            // ]
        }
    }
    this.sendAssessment({requestBody, methodType}).subscribe((response: any) => {
      console.log("Assessment status updated with 2");
      window.location.href = '/learn/course/' + res.courseId + '/batch/' + res.batchId;
    })
  }

  sendAssessment(data): Observable<any> {
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.USER_CONTENT_STATE_UPDATE,
      data: _.get(data, 'requestBody')
    };
    return _.get(data, 'methodType') === 'PATCH' && this.contentService.patch(channelOptions).pipe(
      retry(1),
      catchError(err => {
        this.toasterService.error(this.resourceService.messages.emsg.m0005);
        return of(err);
      })
    );
  }

  setmimeType(type) {
    this.mimeType = type;
  }

  endEventData(event: any) {
    this.progressdetails = {}
    if(this.mimeType !== 'application/vnd.sunbird.questionset') {
      if(event?.eid == "END") {
        let edata = _.get(event, 'edata');
        if(edata?.currentPage && edata?.totalPages) {
          this.completionPercentage = this.calculateCompletedPercentage(edata.currentPage, edata.totalPages);
          this.progressdetails['max_size'] = edata.totalPages;
          let count = 1;
          this.progressdetails['current'] = [];
          if(edata.currentPage == edata.totalPages) {
            this.progressdetails['current'].push(1);
          } else {
            while(edata.currentPage > 0) {
              this.progressdetails['current'].push(count)
              count++;
              edata.currentPage--;
            }
          }
        } else if(edata?.currentTime && edata?.totalTime) {
          this.completionPercentage = this.calculateCompletedPercentage(edata.currentTime, edata.totalTime);
          this.progressdetails['max_size'] = edata.totalTime;
          this.progressdetails['current'] = [];
          if(edata.currentTime == edata.totalTime) {
            this.progressdetails['current'].push(0)
          } else {
            this.progressdetails['current'].push(edata.currentTime);
          }
        }
      }
    }
    console.log("progressdetails", this.progressdetails);
  }

  calculateCompletedPercentage(completed: any, total: any) {
    let percentage: any;

    percentage = (completed / total) * 100

    return Math.ceil(percentage) > 98 ? 100 : Math.ceil(percentage);
  }

  storeVisitedContent(response: any) {
    if(response?.content.length > 0) {
      response.content?.forEach((content: any) => {
        this.contentProgress['content_'+`${content.contentId}`] = content.progressdetails?.current;
      });
    }
    this.setLastReadContent(response);
  }

  updateCourseStatus(response: any, noOfContents?: number){
    //Emit 0 for starting the course, if content state read api fails
    if(response == 0) {
      this.courseStatus$.next(0);
      return;
    }
    //Emit 1 for resuming the course, if response and contentId's are not matched.
    if(response.length != noOfContents) {
      this.courseStatus$.next(1);
      return;
    }
    if(response.length > 0) {
      let restart = 0 ;
      let start = 0;
      response.every((res: any) => {
        if(res.status == 2){
          restart++;
          return true;
        }
        if (res.status == 1 && ((res.progress == 0) || (res.completionPercentage == 0)) && (res.progress == res.completedPercentage)) {
          start++;
          return true;
        }
        //Emit 1 for Resuming the course if any of the module has progress less than 100 and above 0 with status 1
        if(res.status == 1 && ((res.progress > 0 && res.progress < 100) || (res.completionPercentage > 0 && res.completionPercentage < 100))) {
          this.courseStatus$.next(1);
          return false;
        }
      });
      //Emit 0 for starting the course if none of the module has started
      if(start == response.length) {
        this.courseStatus$.next(0);
        return;
      }
      //Emit 2 for Restarting the course if all modules completes with status 2
      if(restart == response.length) {
        this.courseStatus$.next(2);
        return;
      }
      //Emit 1 if few courses consumed and other courses not consumed
      if(start != 0 || restart !=0) {
        this.courseStatus$.next(1);
        return;
      }
    } else {
      //Emit 0 for for starting the course, if content state read api has empty results
      this.courseStatus$.next(0);
    }
  }

  setLastReadContent(response: any) {
    this.lastReadContentId.next(response.lastPlayedContentId);
  }

  getLastReadContent() {
    return this.lastReadContentId.asObservable();
  }

  setResultMessage(message: string) {
    this.resultMessage = message;
  }


}
