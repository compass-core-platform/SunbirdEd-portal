import { combineLatest, Subject, throwError, BehaviorSubject } from 'rxjs';
import { map, mergeMap, first, takeUntil, delay, switchMap } from 'rxjs/operators';
import { ResourceService, ToasterService, ConfigService, NavigationHelperService, LayoutService } from '@sunbird/shared';
import { CourseConsumptionService, CourseBatchService, CourseProgressService } from './../../../services';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { CoursesService, PermissionService, GeneraliseLabelService, UserService } from '@sunbird/core';
import dayjs from 'dayjs';
import { GroupsService } from '../../../../groups/services/groups/groups.service';
import { CoursePageContentService } from "../../../services/course-page-content.service";
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';

@Component({
  templateUrl: './course-consumption-page.component.html',
  styleUrls: ['./course-consumption-page.component.scss']
})
export class CourseConsumptionPageComponent implements OnInit, OnDestroy {
  public courseId: string;
  public batchId: string;
  public showLoader = true;
  public showError = false;
  public courseHierarchy: any;
  public unsubscribe$ = new Subject<void>();
  public enrolledBatchInfo: any;
  public groupId: string;
  public showAddGroup = null;
  public contentIds = [];
  public contentStatus = [];
  layoutConfiguration;
  showBatchInfo: boolean;
  courseTabs: any;
  batchList = [];
  showBatchList;
  selectedCourseBatches: { onGoingBatchCount: any; expiredBatchCount: any; openBatch: any; inviteOnlyBatch: any; courseId: any; };
  obs$;
  private fetchEnrolledCourses$ = new BehaviorSubject<boolean>(true);
  config:any;
  configContent: any;
  tocList = [];
  queryParams: any = {};
  progressToDisplay = 0;
  _routerStateContentStatus: any;
  breadCrumbData;

  constructor(private activatedRoute: ActivatedRoute, private configService: ConfigService,
    private courseConsumptionService: CourseConsumptionService, private coursesService: CoursesService,
    public toasterService: ToasterService, public courseBatchService: CourseBatchService,
    private resourceService: ResourceService, public router: Router, private groupsService: GroupsService,
    public navigationHelperService: NavigationHelperService, public permissionService: PermissionService,
    public layoutService: LayoutService, public generaliseLabelService: GeneraliseLabelService,
    public coursePageContentService: CoursePageContentService, private userService: UserService,
    @Inject('CS_COURSE_SERVICE') private CsCourseService: CsCourseService,
    private courseProgressService: CourseProgressService,) {
  }
  ngOnInit() {
    this.initLayout();
    this.fetchEnrolledCourses$.pipe(switchMap(this.handleEnrolledCourses.bind(this)))
      .subscribe(({ courseHierarchy, enrolledBatchDetails }: any) => {
        this.enrolledBatchInfo = enrolledBatchDetails;
        this.courseHierarchy = courseHierarchy;
        this.contentIds = this.courseConsumptionService.parseChildren(this.courseHierarchy);
        this.courseConsumptionService.setContentIds(this.contentIds);
        this.courseHierarchy['mimeTypeObjs'] = JSON.parse(this.courseHierarchy.mimeTypesCount);
        this.layoutService.updateSelectedContentType.emit(courseHierarchy.contentType);
        this.getContentState();
        this.getGeneraliseResourceBundle();
        this.checkCourseStatus(courseHierarchy);
        this.updateBreadCrumbs();
        this.updateCourseContent()
        this.getAllBatchDetails();
        this.showLoader = false;
        this.config = {
          className:'dark-background',
          title: this.courseHierarchy.name, 
          description: this.courseHierarchy.description,
          contentType: this.courseHierarchy.contentType,
          image:this.courseHierarchy.posterImage || 'assets/common-consumption/images/abstract_02.svg',
          keywords: this.courseHierarchy.keywords,
          rating:4.2,
          numberOfRating:'123 ratings',
          duration:this.courseHierarchy.Duration
        };
        this.breadCrumbData = [
          {
              "label": "Learn",
              "status": "inactive",
              "link": "resources",
              "showIcon": true
          }
      ];
      const stored = localStorage.getItem('breadCrumbForAllComp');
      if(stored){
        let param = {};
        const parsedData = JSON.parse(stored);
        param['label'] = parsedData.label;
        param['status'] = "inactive";
        let channelId = parsedData.channel;
        let fw = parsedData.framework;
        param['link'] = parsedData.link;
        param['showIcon'] = true;
        this.breadCrumbData.push(param);
      }
      const newBreadCrumb = {
        "label": this.config.title,
        "status": "active",
        "link": "",
        "showIcon": false}
        this.breadCrumbData.push(newBreadCrumb);
      
      }, err => {
        if (_.get(err, 'error.responseCode') && err.error.responseCode === 'RESOURCE_NOT_FOUND') {
          this.toasterService.error(this.generaliseLabelService.messages.emsg.m0002);
        } else {
          this.toasterService.error(this.resourceService.messages.fmsg.m0003); // fmsg.m0001 for enrolled issue
        }
        this.navigationHelperService.navigateToResource('/learn');
      });
      this.coursePageContentService.getCoursePageContent().subscribe((res:any) => {
        this.courseTabs = res.courseTabs.data;
        this.configContent = res;
    })
  }

  private handleEnrolledCourses() {
    return this.coursesService.enrolledCourseData$.pipe(first(),
      mergeMap(({ enrolledCourses }) => {
        const routeParams: any = { ...this.activatedRoute.snapshot.params, ...this.activatedRoute.snapshot.firstChild.params };
        const queryParams = this.activatedRoute.snapshot.queryParams;
        this.courseId = routeParams.courseId;
        this.groupId = queryParams.groupId;

        if (this.groupId) {
          this.getGroupData();
        } else {
          this.showAddGroup = false;
        }
        const paramsObj = { params: this.configService.appConfig.CourseConsumption.contentApiQueryParams };
        const enrollCourses: any = this.getBatchDetailsFromEnrollList(enrolledCourses, routeParams);
        if (routeParams.batchId && !enrollCourses) { // batch not found in enrolled Batch list
          return throwError('ENROLL_BATCH_NOT_EXIST');
        }
        if (enrollCourses) { // batch found in enrolled list
          this.batchId = enrollCourses.batchId;
          if (enrollCourses.batchId !== routeParams.batchId) { // if batch from route dint match or not present
            this.router.navigate([`learn/course/${this.courseId}/batch/${this.batchId}`]); // but course was found in enroll list
          }
        } else {
          // if query params has batch and autoEnroll=true then auto enroll to that batch
          if (queryParams.batch && queryParams.autoEnroll) {
            if (this.permissionService.checkRolesPermissions(['COURSE_MENTOR'])) {
              this.router.navigate([`learn/course/${this.courseId}`]); // if user is mentor then redirect to course TOC page
            } else {
              const reqParams = {
                queryParams: { autoEnroll: queryParams.autoEnroll }
              };
              this.router.navigate([`learn/course/${this.courseId}/enroll/batch/${queryParams.batch}`], reqParams);
            }
          }
        }
        return this.getDetails(paramsObj);
      }), delay(200),
      takeUntil(this.unsubscribe$));
  }

  getGeneraliseResourceBundle() {
    this.resourceService.languageSelected$.pipe(takeUntil(this.unsubscribe$)).subscribe(item => {
      this.generaliseLabelService.initialize(this.courseHierarchy, item.value);
    });
  }

  initLayout() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe$)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
      });
  }
  private getBatchDetailsFromEnrollList(enrolledCourses = [], { courseId, batchId }) {
    this.showBatchInfo = false;
    const allBatchesOfCourse = _.filter(enrolledCourses, { courseId })
      .sort((cur: any, prev: any) => dayjs(cur.enrolledDate).valueOf() > dayjs(prev.enrolledDate).valueOf() ? -1 : 1);
    const curBatch = _.find(allBatchesOfCourse, { batchId }); // find batch matching route batchId
    if (curBatch) { // activateRoute batch found
      return curBatch;
    }

    const { onGoingBatchCount, expiredBatchCount, openBatch, inviteOnlyBatch } = this.coursesService.findEnrolledCourses(courseId);
    if (!expiredBatchCount && !onGoingBatchCount) {
      return _.get(allBatchesOfCourse, '[0]') || null;
    } else {
      if (onGoingBatchCount === 1) {
        return _.get(openBatch, 'ongoing.length') ? _.get(openBatch, 'ongoing[0]') : _.get(inviteOnlyBatch, 'ongoing[0]');
      } else {
        this.selectedCourseBatches = { onGoingBatchCount, expiredBatchCount, openBatch, inviteOnlyBatch, courseId };
        this.showBatchInfo = true;
        return _.get(allBatchesOfCourse, '[0]') || null;
      }
    }
  }
  private getDetails(queryParams) {
    if (this.batchId) {
      return combineLatest(
        this.courseConsumptionService.getCourseHierarchy(this.courseId, queryParams),
        this.courseBatchService.getEnrolledBatchDetails(this.batchId)
      ).pipe(map(result => ({ courseHierarchy: result[0], enrolledBatchDetails: result[1] })));
    } else {
      return this.courseConsumptionService.getCourseHierarchy(this.courseId, queryParams)
        .pipe(map(courseHierarchy => ({ courseHierarchy })));
    }
  }
  private checkCourseStatus(courseHierarchy) {
    if (!['Live', 'Unlisted', 'Flagged'].includes(courseHierarchy.status)) {
      this.toasterService.warning(this.generaliseLabelService.messages.imsg.m0026);
      this.router.navigate(['/learn']);
    }
  }
  private updateBreadCrumbs() {
    if (this.batchId) {
      // this.breadcrumbsService.setBreadcrumbs([{
      //   label: this.courseHierarchy.name,
      //   url: '/learn/course/' + this.courseId + '/batch/' + this.batchId
      // }]);
    } else {
      // this.breadcrumbsService.setBreadcrumbs([{
      //   label: this.courseHierarchy.name,
      //   url: '/learn/course/' + this.courseId
      // }]);
    }
  }

  getGroupData() {
    this.groupsService.getGroupById(this.groupId, true, true).pipe(takeUntil(this.unsubscribe$)).subscribe(groupData => {
      this.groupsService.groupData = _.cloneDeep(groupData);
      this.showAddGroup = _.get(this.groupsService.addGroupFields(groupData), 'isAdmin');
    }, err => {
      this.showAddGroup = false;
      this.toasterService.error(this.resourceService.messages.emsg.m002);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  refreshComponent(isRouteChanged: boolean) {
    this.showBatchInfo = false;
    isRouteChanged && this.fetchEnrolledCourses$.next(true); // update component only if batch is changed.
  }

  addWishList(){
    console.log('Add to wish list');
  }

  // updateCourseContent(hierarchy?: any) {
  //   if(hierarchy) {
  //     this.tocList = this.courseConsumptionService.getCourseContent(hierarchy);
  //   } else {
  //     if(this.courseConsumptionService.getCourseContent()?.length > 0) {
  //       this.tocList = this.courseConsumptionService.getCourseContent();
  //     }
  //   }
  //   console.log("tocList here",this.tocList);
  // }

  updateCourseContent() {
    if(this.courseConsumptionService.getCourseContent()?.length > 0) {
      this.tocList = this.courseConsumptionService.getCourseContent();
    }
  }

  contentClicked(event: any) {
    if(!this.courseConsumptionService.isUserExistInBatch()){
      this.courseConsumptionService.enrollToCourse(this.courseHierarchy);
    }
    this.router.navigate(['/learn/course/play',event.content.collectionId],
    { 
      queryParams: { 
        batchId: this.batchId || this.courseConsumptionService.getBatchId(),
        courseId: this.courseHierarchy.identifier,
        courseName: this.courseHierarchy.name,
        selectedContent:  event.content.selectedContent,
        parent: event.content.collectionId
      }
    });
  }

  getAllBatchDetails() {
    // this.showCreateBatchBtn = false;
    // this.showBatchList = false;
    // this.showError = false;
    // this.batchList = [];
    const searchParams: any = {
      filters: {
        courseId: this.courseHierarchy.identifier,
        status: ['1']
      },
      offset: 0,
      sort_by: { createdDate: 'desc' }
    };
    const searchParamsCreator =  _.cloneDeep(searchParams);
    const searchParamsMentor =  _.cloneDeep(searchParams);

       searchParams.filters.enrollmentType = 'open';
       this.courseBatchService.getAllBatchDetails(searchParams).pipe(
        takeUntil(this.unsubscribe$))
        .subscribe((data: any) => {
          // this.allBatchDetails.emit(_.get(data, 'result.response'));
          if (data.result.response.content && data.result.response.content.length > 0) {
              this.batchList = data.result.response.content;
              
            } else {
              this.showBatchList = true;
          }
        },
        (err:any) => {
         
        });
}
   


  private getContentState() {
    const fieldsArray: Array<string> = ['progress', 'score'];
    const req: any = {
      userId: this.userService.userid,
      courseId: this.courseId,
      contentIds: this.contentIds,
      batchId: this.batchId,
      fields: fieldsArray
    };

    console.log("payload", req);
    this.CsCourseService
      .getContentState(req, { apiPath: '/content/course/v1' })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.tocList = this.courseConsumptionService.attachProgresstoContent(res);
        const _parsedResponse = this.courseProgressService.getContentProgressState(req, res);
        //set completedPercentage for consumed courses
        this.courseProgressService.storeVisitedContent(_parsedResponse);
        // this.progressToDisplay = Math.floor((_parsedResponse.completedCount / this.courseHierarchy.leafNodesCount) * 100);
        // this.contentStatus = _parsedResponse.content || [];
        // this._routerStateContentStatus = _parsedResponse;
        // this.calculateProgress();
        // this.updateCourseContent(this.courseHierarchy);
      }, error => {
        console.log('Content state read CSL API failed ', error);
      });
  }



}
