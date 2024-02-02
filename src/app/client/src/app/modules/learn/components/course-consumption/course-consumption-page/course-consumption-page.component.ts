import { combineLatest, Subject, throwError, BehaviorSubject } from 'rxjs';
import { map, mergeMap, first, takeUntil, delay, switchMap } from 'rxjs/operators';
import { ResourceService, ToasterService, ConfigService, NavigationHelperService, LayoutService, SnackBarComponent } from '@sunbird/shared';
import { CourseConsumptionService, CourseBatchService, CourseProgressService } from './../../../services';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { CoursesService, PermissionService, GeneraliseLabelService, UserService } from '@sunbird/core';
import dayjs from 'dayjs';
import { GroupsService } from '../../../../groups/services/groups/groups.service';
import { CoursePageContentService } from "../../../services/course-page-content.service";
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';
import { AssessmentScoreService } from './../../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicPlayerService } from '@sunbird/public';
import { WishlistedService } from '../../../../../service/wishlisted.service';

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
  config: any;
  configContent: any;
  tocList = [];
  queryParams: any = {};
  progressToDisplay = 0;
  _routerStateContentStatus: any;
  breadCrumbData;
  contentTabLabel: string;
  allWishlistedIds = [];
  isWishlisted: boolean = false;
  // questionSetEvaluable: any;

  constructor(private activatedRoute: ActivatedRoute, private configService: ConfigService,
    private courseConsumptionService: CourseConsumptionService, private coursesService: CoursesService,
    public toasterService: ToasterService, public courseBatchService: CourseBatchService,
    private resourceService: ResourceService, public router: Router, private groupsService: GroupsService,
    public navigationHelperService: NavigationHelperService, public permissionService: PermissionService,
    public layoutService: LayoutService, public generaliseLabelService: GeneraliseLabelService,
    public coursePageContentService: CoursePageContentService, private userService: UserService,
    @Inject('CS_COURSE_SERVICE') private CsCourseService: CsCourseService,
    private courseProgressService: CourseProgressService, public assessmentScoreService: AssessmentScoreService, private snackBar: MatSnackBar,
    public publicPlayerService: PublicPlayerService, private wishlistedService: WishlistedService) {
  }
  ngOnInit() {

    this.initLayout();
    this.fetchEnrolledCourses$.pipe(switchMap(this.handleEnrolledCourses.bind(this)))
      .subscribe(({ courseHierarchy, enrolledBatchDetails }: any) => {
        this.enrolledBatchInfo = enrolledBatchDetails;
        this.courseHierarchy = courseHierarchy;
        if(courseHierarchy.primaryCategory == "Course"){
          this.contentTabLabel = this.resourceService.frmelmnts.toc.tab.courseContent;
        } else {
          this.contentTabLabel = this.resourceService.frmelmnts.toc.tab.assessmentContent;
        }
        this.contentIds = this.courseConsumptionService.parseChildren(this.courseHierarchy);
        this.courseConsumptionService.setContentIds(this.contentIds);
        this.courseHierarchy['mimeTypeObjs'] = JSON.parse(this.courseHierarchy.mimeTypesCount);
        this.layoutService.updateSelectedContentType.emit(courseHierarchy.contentType);
        this.checkWishlisted();
        this.getContentState();
        this.getGeneraliseResourceBundle();
        this.checkCourseStatus(courseHierarchy);
        this.updateBreadCrumbs();
        this.updateCourseContent()
        this.getAllBatchDetails();
        this.getCourseBatchState();
        this.showLoader = false;
        this.config = {
          className: 'dark-background',
          title: this.courseHierarchy.name,
          description: this.courseHierarchy.description,
          contentType: this.courseHierarchy.contentType,
          primaryCategory: this.courseHierarchy.primaryCategory,
          image: this.courseHierarchy.posterImage || 'assets/common-consumption/images/abstract_02.svg',
          keywords: this.courseHierarchy.keywords,
          rating: 0,
          numberOfRating: '0 Ratings',
          duration: this.courseHierarchy.Duration,
          isWishListed: this.isWishlisted
        };
        this.breadCrumbData = [
          {
            "label": "Learn",
            "status": "inactive",
            "link": "resources",
            "icon": "school"
          }
        ];
        const stored = localStorage.getItem('breadCrumbForAllComp');
        if (stored) {
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
          "icon": "play_circle_filled"
        }
        this.breadCrumbData.push(newBreadCrumb);
        this.getCourseRating(this.courseId);
      }, err => {
        if (_.get(err, 'error.responseCode') && err.error.responseCode === 'RESOURCE_NOT_FOUND') {
          this.toasterService.error(this.generaliseLabelService.messages.emsg.m0002);
        } else {
          this.toasterService.error(this.resourceService.messages.fmsg.m0003); // fmsg.m0001 for enrolled issue
        }
        // this.navigationHelperService.navigateToResource('/learn');
      });
    this.coursePageContentService.getCoursePageContent().subscribe((res: any) => {
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
        // if (routeParams.batchId && !enrollCourses) { // batch not found in enrolled Batch list
        //   return throwError('ENROLL_BATCH_NOT_EXIST');
        // }
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

  addWishList(option: string) {
    console.log("Icon: ", option);

    let payload = {
      "request": {
          "userId": this.userService._userid,
          "courseId": this.courseHierarchy.identifier
      }
    }

    if(option === 'selected') {
      this.wishlistedService.addToWishlist(payload).subscribe((res: any) => {
          if(res) {
              this.config['isWishListed'] = true;
              this.wishlistedService.updateData({ message: 'Added to Wishlist' });
              this.snackBar.openFromComponent(SnackBarComponent, {
                  duration: 2000,
                  panelClass: ['wishlist-snackbar']
              });
          }
      });
    } else {
      this.wishlistedService.removeFromWishlist(payload).subscribe((res: any) => {
          if(res) {
            this.config['isWishListed'] = false;
              this.wishlistedService.updateData({ message: 'Removed from Wishlist' });
              this.snackBar.openFromComponent(SnackBarComponent, {
                  duration: 2000,
                  panelClass: ['wishlist-snackbar']
              });
          }
      });
    }
  }

  checkWishlisted() {
    let payload = {
      "request": {
        "userId": this.userService._userid
      }
    }

    this.wishlistedService.getWishlistedCourses(payload).subscribe((res: any) => {
      if (res.result.wishlist.length > 0) {
        this.allWishlistedIds = res.result.wishlist;
        this.allWishlistedIds.forEach((id:string) => {
          if(id === this.courseHierarchy.identifier) {
            this.config['isWishListed'] = true;
          }
        });
      }
    });
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
    //  if(this.courseConsumptionService.getCourseContent()?.length > 0) {
    this.tocList = this.courseConsumptionService.getCourseContent();
    //}
  }

  contentClicked(event: any) {
    if (!this.courseConsumptionService.isUserExistInBatch()) {
      this.courseConsumptionService.enrollToCourse(this.courseHierarchy);
    }
    this.router.navigate(['/learn/course/play', event.content.collectionId],
      {
        queryParams: {
          batchId: this.batchId || this.courseConsumptionService.getBatchId(),
          courseId: this.courseHierarchy.identifier,
          courseName: this.courseHierarchy.name,
          selectedContent: event.content.selectedContent,
          parent: event.content.collectionId,
          courseType: this.courseHierarchy.primaryCategory
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
    const searchParamsCreator = _.cloneDeep(searchParams);
    const searchParamsMentor = _.cloneDeep(searchParams);

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
        (err: any) => {

        });
  }



  private getContentState() {
    this.courseProgressService.setResultMessage('');
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
        let csrResponse: any = res;

        //generate certificate, if passing criteria meets for assessment
        if(this.courseHierarchy.primaryCategory.toLowerCase() == 'assessment') {
          this.checkPassingCriteria(res);
          let attemptKey = 'currentAttempt_'+this.courseId;
          localStorage.setItem(attemptKey, csrResponse[0]?.attempts);
        } else {
          this.courseConsumptionService.calculateAvgCourseProgress(res);
        }
        this.tocList = this.courseConsumptionService.attachProgresstoContent(res, this.courseHierarchy.primaryCategory.toLowerCase());
        const _parsedResponse = this.courseProgressService.getContentProgressState(req, res);
        //set completedPercentage for consumed courses
        this.courseProgressService.storeVisitedContent(_parsedResponse);
        this.courseProgressService.updateCourseStatus(res, this.contentIds.length);
      }, error => {
        this.courseConsumptionService.calculateAvgCourseProgress([]);
        this.courseProgressService.updateCourseStatus(0);
        console.log('Content state read CSL API failed ', error);
      });
  }

  checkPassingCriteria(res: any) {
    // let courseEvaluable = this.serverValidationCheck( _.get(this.courseHierarchy, 'children')[0].children[0].evalMode);
    let contentId = _.get(this.courseHierarchy, 'children')[0].children[0].identifier;
    let collectionId = _.get(this.courseHierarchy, 'children')[0].identifier;
      const requestBody = {
        request: {
          questionset: {
            contentID: contentId,
            collectionID: collectionId, 
            userID: this.userService._userid,
            attemptID: this.assessmentScoreService.generateHash()
          }
        }
      }
      this.publicPlayerService.getQuestionSetHierarchyByPost(requestBody).pipe(
        takeUntil(this.unsubscribe$))
        .subscribe((response) => {  
          //calculate percentage here
          if(res[0]?.bestScore) {
            let totalPercentage = this.getTotalPercentage(res[0].bestScore);   
            if(totalPercentage >= response?.questionset?.minimumPassPercentage) {
              if(res[0].status !== 2) {
                this.courseProgressService.statusCompletion(res[0], this.userService.userid)
              } else {
                this.courseProgressService.setResultMessage('Pass');
              }
            } else {
              this.courseProgressService.setResultMessage('Fail');
            }
            this.courseConsumptionService.calculateAvgCourseProgress(res, 'assessment');
          }
        });
  }

  getTotalPercentage(score: any) {
    if(score.totalMaxScore == 0) {
      return 0
    }
    return score.totalScore / score.totalMaxScore * 100
  }

  getCourseRating(courseId: string) {
    this.courseConsumptionService.getCourseRating(courseId).subscribe((res: any) => {
      // console.log('Rating', res);
      let rating: number = res["result"]["response"] != null ? res["result"]["response"]["sum_of_total_ratings"] : 0;
      let numberOfRatings: number = res["result"]["response"] != null ? res["result"]["response"]["total_number_of_ratings"] : 0;
      this.config.numberOfRating = res["result"]["response"] != null ? `${res["result"]["response"]["total_number_of_ratings"]} ratings` : '0 ratings';
      this.config.rating = rating == 0 || numberOfRatings == 0 ? 0 : parseFloat((rating / numberOfRatings).toFixed(1));
    });
  }

  getCourseBatchState(){
    this.courseProgressService.geCourseBatchState({...this.activatedRoute.snapshot.firstChild.params, userId: this.userService.userid}).subscribe(res => {
      this.courseConsumptionService.courseBatchProgress.next(res);
    });
  }
}
