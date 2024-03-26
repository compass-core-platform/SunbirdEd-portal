import { Location } from '@angular/common';
import { TelemetryService, IAuditEventInput, IImpressionEventInput } from '@sunbird/telemetry';
import { Component, OnInit, OnDestroy, ViewChild, Inject, HostListener, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras, NavigationStart } from '@angular/router';
import { TocCardType } from '@project-sunbird/common-consumption';
import { UserService, GeneraliseLabelService, PlayerService } from '@sunbird/core';
import { AssessmentScoreService, CourseBatchService, CourseConsumptionService, CourseProgressService } from '@sunbird/learn';
import { PublicPlayerService, ComponentCanDeactivate } from '@sunbird/public';
import {
  ConfigService, ResourceService, ToasterService, NavigationHelperService,
  ContentUtilsServiceService, ITelemetryShare, LayoutService
} from '@sunbird/shared';
import * as _ from 'lodash-es';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil, tap } from 'rxjs/operators';
import { CsContentProgressCalculator } from '@project-sunbird/client-services/services/content/utilities/content-progress-calculator';
import TreeModel from 'tree-model';
import { NotificationServiceImpl } from './../../../notification/services/notification/notification-service-impl';
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';
import { result } from 'lodash';

const ACCESSEVENT = 'renderer:question:submitscore';

@Component({
  selector: 'app-ecml-handler-component',
  templateUrl: './ecml-handler-component.component.html',
  styleUrls: ['./ecml-handler-component.component.scss']
})
export class EcmlHandlerComponentComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  constructor(
    public resourceService: ResourceService,
    private activatedRoute: ActivatedRoute,
    private courseConsumptionService: CourseConsumptionService,
    private configService: ConfigService,
    private courseBatchService: CourseBatchService,
    private toasterService: ToasterService,
    private location: Location,
    private playerService: PlayerService,
    private publicPlayerService: PublicPlayerService,
    private userService: UserService,
    private assessmentScoreService: AssessmentScoreService,
    private navigationHelperService: NavigationHelperService,
    private router: Router,
    private contentUtilsServiceService: ContentUtilsServiceService,
    private telemetryService: TelemetryService,
    private layoutService: LayoutService,
    public generaliseLabelService: GeneraliseLabelService,
    private CourseProgressService: CourseProgressService,
    @Inject('CS_COURSE_SERVICE') private CsCourseService: CsCourseService,
    @Inject('SB_NOTIFICATION_SERVICE') private notificationService: NotificationServiceImpl
  ) {
    this.playerOption = {
      showContentRating: true
    };
    // this.assessmentMaxAttempts = this.configService.appConfig.CourseConsumption.selfAssessMaxLimit;
    const _routerExtras = this.router.getCurrentNavigation();
    if (_.get(_routerExtras, 'extras.state')) {
      this.isRouterExtrasAvailable = true;
      this._routerStateContentStatus = _.get(_routerExtras, 'extras.state.contentStatus');
      this.contentStatus = _.get(_routerExtras, 'extras.state.contentStatus.content') ?
        _.get(_routerExtras, 'extras.state.contentStatus.content') : [];
    }
  }
  @ViewChild('modal') modal;
  @Output() assessmentEvents = new EventEmitter<any>();
  private unsubscribe = new Subject<void>();
  contentProgressEvents$ = new Subject();
  batchId: string;
  collectionId: string;
  courseId: string;
  courseHierarchy;
  enrolledBatchInfo;
  showLoader = true;
  noContentMessage = '';
  activeContent: any;
  isContentPresent = false;
  courseFallbackImg = './../../../../../assets/images/book.png';
  cardType: TocCardType = TocCardType.COURSE;
  contentStatus = [];
  playerConfig;
  playerOption;
  courseName: string;
  courseProgress: number;
  private objectRollUp = {};
  public treeModel: any;
  isParentCourse = false;
  telemetryContentImpression: IImpressionEventInput;
  telemetryPlayerPageImpression: IImpressionEventInput;
  telemetryCdata: Array<{}>;
  shareLink: string;
  telemetryShareData: Array<ITelemetryShare>;
  shareLinkModal: boolean;
  isUnitCompleted = false;
  isFullScreenView = false;
  isCourseCompleted = false;
  showCourseCompleteMessage = false;
  certificateDescription = {};
  parentCourse;
  prevModule;
  nextModule;
  totalContents = 0;
  consumedContents = 0;
  layoutConfiguration;
  isCourseCompletionPopupShown = false;
  previousContent = null;
  groupId;
  assessmentMaxAttempts: number;
  showMaxAttemptsModal = false;
  isRouterExtrasAvailable = false;
  _routerStateContentStatus: any;
  showLastAttemptsModal = false;
  navigationObj: { event: any; id: any; };
  showPlayer = false;
  showQSExitConfirmation = false;
  isStatusChange = false;
  lastActiveContentBeforeModuleChange;
  contentRatingModal = false;
  attemptID: any;
  courseEvaluable: any;
  questionSetEvaluable: any;
  tocList: any = [];
  selectedContentName: any;
  parentContentId: any;
  isSectionVisible: boolean = true;
  completedCount: any = 0;
  totalCount: any = 0;
  visitedData: any;
  selectedContentId: any;
  contentIds: any;
  contentTitle: string = '';
  courseType: string = '';
  iframeInterval: any;
  userId:string = '';

  @HostListener('window:beforeunload')
  canDeactivate() {
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return _.get(this.activeContent, 'mimeType') === 'application/vnd.sunbird.questionset' && !this.showQSExitConfirmation ? false : true;
  }

  navigateToPlayerPage(collectionUnit: any, event?) {
    this.previousContent = null;
    this.lastActiveContentBeforeModuleChange = this.activeContent;
    const navigationExtras: NavigationExtras = {
      queryParams: { batchId: this.batchId, courseId: this.courseId, courseName: this.parentCourse.name, parent: collectionUnit?.identifier, selectedContent: collectionUnit?.children[0]?.identifier },
      state: { contentStatus: this._routerStateContentStatus }
    };

    if (event && !_.isEmpty(event.event)) {
      navigationExtras.queryParams.selectedContent = event.data.identifier;
    } else if (_.get(collectionUnit, 'mimeType') === 'application/vnd.ekstep.content-collection' && _.get(collectionUnit, 'children.length')
      && _.get(this.contentStatus, 'length')) {
      const parsedChildren = this.courseConsumptionService.parseChildren(collectionUnit);
      const collectionChildren = [];
      this.contentStatus.forEach(item => {
        if (parsedChildren.find(content => content === item.contentId)) {
          collectionChildren.push(item);
        }
      });

      /* istanbul ignore else */
      if (collectionChildren.length) {
        const selectedContent: any = collectionChildren.find(item => item.status !== 2);

        /* istanbul ignore else */
        if (selectedContent) {
          navigationExtras.queryParams.selectedContent = selectedContent.contentId;
        }
      }
    }
    this.router.navigate(['/learn/course/play', _.get(collectionUnit, 'identifier')], navigationExtras);
  }

  ngOnInit() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.initLayout();
    this.subscribeToQueryParam();
    // this.getContentState();
    this.subscribeToContentProgressEvents().subscribe(data => { });
    this.navigationHelperService.contentFullScreenEvent.
      pipe(takeUntil(this.unsubscribe)).subscribe(isFullScreen => {
        this.isFullScreenView = isFullScreen;
      });
    this.noContentMessage = _.get(this.resourceService, 'messages.stmsg.m0121');
    this.getLanguageChangeEvent();
    this.routerEventsChangeHandler().subscribe();
    // this.updateCourseContent();
    // this.hideElements();
  }

  // hideElements() {
  //   this.iframeInterval = setInterval(this.hideHeader, 500);
  // }

  // hideHeader() {
  //   var divElement1: any = document.getElementsByClassName("compass-header")[0];
  //   if (divElement1 != undefined) {
  //     divElement1.style.display = "none";
  //     clearInterval(this.iframeInterval);
  //     // this.iframeInterval = setInterval(this.hideFooter, 500);
  //     var divElement2: any = document.getElementsByClassName("new-layout-footer")[0];
  //     if (divElement2 != undefined) {
  //       divElement2.style.display = "none";
  //     }
  //   }
  // }

  // hideFooter() 
  // {
  //   var divElement2: any = document.getElementsByClassName("new-layout-footer")[0];
  //   if (divElement2 != undefined) {
  //     divElement2.style.display = "none";
  //     clearInterval(this.iframeInterval);
  //   }
  // }

  initLayout() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
      });
  }

  // goBack() {
  //   this.previousContent = null;
  //   this.lastActiveContentBeforeModuleChange = this.activeContent;
  //   const paramas = {};
  //   if (!this.isCourseCompletionPopupShown) {
  //     paramas['showCourseCompleteMessage'] = true;
  //   }
  //   if (_.get(this.activatedRoute, 'snapshot.queryParams.textbook')) {
  //     paramas['textbook'] = _.get(this.activatedRoute, 'snapshot.queryParams.textbook');
  //   }
  //   if (!this.isCourseCompleted) {
  //     this.isStatusChange = true;
  //   }
  //   setTimeout(() => {
  //     if (this.batchId) {
  //       this.router.navigate(['/learn/course', this.courseId, 'batch', this.batchId], { queryParams: paramas });
  //     } else {
  //       this.router.navigate(['/learn/course', this.courseId], { queryParams: paramas });
  //     }
  //   }, 500);
  // }

  getLanguageChangeEvent() {
    this.resourceService.languageSelected$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      this.noContentMessage = _.get(this.resourceService, 'messages.stmsg.m0121');
    });
  }

  private subscribeToQueryParam() {
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(([params, queryParams]) => {
        this.consumedContents = 0;
        this.totalContents = 0;
        this.userId = queryParams.userId;
        this.parentContentId = queryParams.parent;
        this.collectionId = queryParams.collectionId;
        this.batchId = queryParams.batchId;
        this.courseId = queryParams.courseId;
        this.courseName = queryParams.courseName;
        this.courseType = queryParams.courseType;
        // alert(queryParams.collectionId);
        this.groupId = _.get(queryParams, 'groupId');
        this.selectedContentId = queryParams.selectedContent;
        let isSingleContent = this.collectionId === this.selectedContentId;
        this.isParentCourse = this.collectionId === this.courseId;
        this.contentIds = this.courseConsumptionService.getContentIds();
        this.totalCount = this.contentIds?.length;
        if (this.batchId) {
          this.telemetryCdata = [{ id: this.batchId, type: 'CourseBatch' }];
          if (this.groupId) {
            this.telemetryCdata.push({
              id: this.groupId,
              type: 'Group'
            });
          }

          this.getCollectionInfo(this.courseId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((data) => {
              const model = new TreeModel();
              this.treeModel = model.parse(data.courseHierarchy);
              this.parentCourse = data.courseHierarchy;
              const module = this.courseConsumptionService.setPreviousAndNextModule(this.parentCourse, this.parentContentId);
              this.nextModule = _.get(module, 'next');
              this.prevModule = _.get(module, 'prev');
              this.layoutService.updateSelectedContentType.emit(data.courseHierarchy.contentType);
              if (!this.isParentCourse && data.courseHierarchy.children) {
                this.courseHierarchy = data.courseHierarchy.children.find(item => item.identifier === this.collectionId);
              } else {
                this.courseHierarchy = data.courseHierarchy;
              }
              this.updateCourseContent();
              if (!this.contentIds || this.contentIds?.length == 0) {
                this.contentIds = this.courseConsumptionService.parseChildren(data.courseHierarchy);
                this.totalCount = this.contentIds?.length;
              }
              this.contentTitle = this.courseHierarchy.name;
              // this.getCourseCompletionStatus();
              console.log("courseHierarchy", this.courseHierarchy);
              if (!isSingleContent && _.get(this.courseHierarchy, 'mimeType') !==
                this.configService.appConfig.PLAYER_CONFIG.MIME_TYPE.collection) {
                isSingleContent = true;
              }
              // this.enrolledBatchInfo = data.enrolledBatchDetails;
              this.certificateDescription = this.courseBatchService.getcertificateDescription(this.enrolledBatchInfo);
              this.setActiveContent(this.selectedContentId, isSingleContent);
            }, error => {
              this.toasterService.error(this.resourceService.messages.fmsg.m0051);
              // this.goBack();
            });
        } else {
          this.telemetryCdata = [{
            id: this.groupId,
            type: 'Group'
          }];
          this.publicPlayerService.getCollectionHierarchy(this.collectionId, {})
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((data) => {
              this.courseHierarchy = data.result.content;
              this.contentTitle = this.courseHierarchy.name;
              if (!this.contentIds || this.contentIds?.length == 0) {
                this.contentIds = this.courseConsumptionService.parseChildren(this.courseHierarchy);
                this.totalCount = this.contentIds?.length;
              }
              this.updateCourseContent();
              this.layoutService.updateSelectedContentType.emit(this.courseHierarchy.contentType);
              if (this.courseHierarchy.mimeType !== 'application/vnd.ekstep.content-collection') {
                this.activeContent = this.courseHierarchy;
                this.initPlayer(_.get(this.activeContent, 'identifier'));
              } else {
                this.setActiveContent(this.selectedContentId);
              }
            }, error => {
              this.toasterService.error(this.resourceService.messages.fmsg.m0051);
              // this.goBack();
            });
        }
        this.setTelemetryCourseImpression();
      });
  }


  private getCollectionInfo(courseId: string): Observable<any> {
    const inputParams = { params: this.configService.appConfig.CourseConsumption.contentApiQueryParams };
    return combineLatest([
      this.courseConsumptionService.getCourseHierarchy(courseId, inputParams),
      // this.courseBatchService.getEnrolledBatchDetails(this.batchId),
    ]).pipe(map((results: any) => {
      return {
        courseHierarchy: results[0],
        enrolledBatchDetails: [],
      };
    }));
  }

  getContentStateRequest(course: any) {
    return {
      userId: this.userId,
      courseId: this.courseId,
      contentIds: this.contentIds,
      batchId: this.batchId,
      fields: ['progress', 'score']
    };
  }
  setActiveContent(selectedContent: string, isSingleContent?: boolean) {
    this.previousContent = _.cloneDeep(this.activeContent);
    if (_.get(this.courseHierarchy, 'children')) {
      let flattenDeepContents = this.courseConsumptionService.flattenDeep(this.courseHierarchy.children);
      flattenDeepContents = _.filter(flattenDeepContents, (o) => o.mimeType !== 'application/vnd.sunbird.question');
      if (selectedContent) {
        this.activeContent = flattenDeepContents.find(content => content.identifier === selectedContent);
      } else {
        this.activeContent = this.firstNonCollectionContent(flattenDeepContents);
      }

      /* istanbul ignore else */
      if (this.activeContent) {
        this.isContentPresent = true;
        this.initPlayer(_.get(this.activeContent, 'identifier'));
      }
    } else if (isSingleContent) {
      this.activeContent = this.courseHierarchy;
      this.initPlayer(_.get(this.activeContent, 'identifier'));
    }
    this.selectedContentName = this.activeContent.name;
    // this.getContentState();
  }

  private firstNonCollectionContent(contents) {
    return contents.find((content) => content.mimeType !== 'application/vnd.ekstep.content-collection');
  }

  navigateToInitPlayer(event: any, id) {
    this.navigationObj = {
      event: event,
      id: id
    };
    if (_.get(event, 'event.isDisabled')) {
      return this.toasterService.error(_.get(this.resourceService, 'frmelmnts.lbl.selfAssessMaxAttempt'));
    } else if (_.get(event, 'event.isLastAttempt') && !this._routerStateContentStatus) {
      this.showLastAttemptsModal = true;
    } else if (_.get(this.navigationObj, 'event.data') && this.navigationObj?.event?.data?.identifier !== this.activeContent?.identifier) {
      this.onTocCardClick();
    }
  }

  onTocCardClick() {
    this.showPlayer = false;
    this.previousContent = _.cloneDeep(this.activeContent);
    this.activeContent = this.navigationObj.event.data;
    console.log("activeContent", this.activeContent);
    this.selectedContentName = this.activeContent.name;
    this.initPlayer(_.get(this.activeContent, 'identifier'));
    this.highlightContent();
    this.logTelemetry(this.navigationObj.id, this.navigationObj.event.data);
  }

  // private getContentState() {
  //   if (this.batchId && (_.get(this.activeContent, 'contentType') === 'SelfAssess' || !this.isRouterExtrasAvailable)) {
  //     const req: any = this.getContentStateRequest(this.courseHierarchy);
  //     this.totalCount = req.contentIds?.length;
  //     this.CsCourseService
  //       .getContentState(req, { apiPath: '/content/course/v1' })
  //       .pipe(takeUntil(this.unsubscribe))
  //       .subscribe((_res) => {
  //         this.tocList = this.courseConsumptionService.attachProgresstoContent(_res, this.courseConsumptionService.courseHierarchy.primaryCategory.toLowerCase());
  //         const res = this.CourseProgressService.getContentProgressState(req, _res);
  //         this.completedCount = res.completedCount;
  //         res.content?.forEach((content: any) => {
  //           if (content.contentId == this.selectedContentId) {
  //             this.visitedData = content.progressdetails?.current;
  //           }
  //         });
  //         // this.pagesVisited = res.content[0].progressdetails?.current;
  //         const _contentIndex = _.findIndex(this.contentStatus, { contentId: _.get(this.activeContent, 'identifier') });
  //         const _resIndex = _.findIndex(res.content, { contentId: _.get(this.activeContent, 'identifier') });
  //         if (_.get(this.activeContent, 'contentType') === 'SelfAssess' && this.isRouterExtrasAvailable) {
  //           this.contentStatus[_contentIndex]['status'] = _.get(res.content[_resIndex], 'status');
  //         } else {
  //           this.contentStatus = res.content || [];
  //         }
  //         this.highlightContent();
  //         this.calculateProgress();
  //       }, error => {
  //         console.log('Content state read CSL API failed ', error);
  //       });
  //   } else {
  //     this.highlightContent();
  //     this.calculateProgress();
  //   }
  // }

  public getCurrentContent() {
    return this.previousContent ? this.previousContent : this.activeContent;
  }
  public getActiveContent() {
    return this.previousContent ? this.previousContent : this.activeContent;
  }
  public contentProgressEvent(event) {
    /* istanbul ignore else */
    if (!this.batchId || _.get(this.enrolledBatchInfo, 'status') !== 1) {
      return;
    }
    const telObject = _.get(event, 'detail.telemetryData');
    const eid = _.get(telObject, 'eid');
    this.CourseProgressService.setmimeType(_.get(this.activeContent, 'mimeType'));
    const isMimeTypeH5P = _.get(this.activeContent, 'mimeType') === 'application/vnd.ekstep.h5p-archive';

    /* istanbul ignore else */
    if (eid === 'END' && !isMimeTypeH5P && !this.validEndEvent(event)) {
      return;
    }
    const request: any = {
      userId: this.userId,
      contentId: _.cloneDeep(_.get(telObject, 'object.id')) || _.get(this.activeContent, 'identifier'),
      courseId: this.courseId,
      batchId: this.batchId,
      status: (eid === 'END' && (_.get(this.getCurrentContent, 'contentType') !== 'SelfAssess') && this.courseProgress === 100
        && !this.isStatusChange) ? 2 : 1,
      progress: (this.courseProgress && !this.isStatusChange) ? this.courseProgress : undefined
    };

    // Set status to 2 if mime type is application/vnd.ekstep.h5p-archive
    if (isMimeTypeH5P) {
      request['status'] = 2;
    }

    /* istanbul ignore else */
    if (!eid) {
      const contentType = this.activeContent.contentType;
      /* istanbul ignore else */
      if (contentType === 'SelfAssess' && _.get(event, 'data') === ACCESSEVENT) {
        request['status'] = 2;
      }
    }

    /* istanbul ignore else */
    if (request.status === 2 && !this.isUnitCompleted) {
      this.logAuditEvent();
    }
    const currentContent = this.getActiveContent();
    const summary = _.get(telObject, 'edata.summary');
    let totallength;
    summary?.forEach((k) => {
      if (k['totallength']) {
        totallength = k['totallength'];
      }
    });
    if ((_.get(currentContent, 'mimeType') === 'application/pdf') && eid === 'END' && totallength === 1) {
      request['status'] = 2;
    }

    this.courseConsumptionService.updateContentsState(request)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(updatedRes => {
        if (!this.isRouterExtrasAvailable) {
          this.contentStatus = _.cloneDeep(updatedRes.content);
        } else {
          const _contentIndex = _.findIndex(this.contentStatus, { contentId: request.contentId });
          const _resIndex = _.findIndex(updatedRes.content, { contentId: request.contentId });
          if (_resIndex !== -1) {
            // Update the available status data object
            this._routerStateContentStatus['progress'] = _.get(updatedRes, 'progress');
            this.contentStatus[_contentIndex]['status'] = _.get(updatedRes.content[_resIndex], 'status');
            this._routerStateContentStatus['totalCount'] = _.get(updatedRes, 'totalCount');
            this._routerStateContentStatus['completedCount'] = _.get(updatedRes, 'completedCount');
          }
        }
        /* istanbul ignore else */
        if (!this.isUnitCompleted) {
          this.calculateProgress(true);
        }
      }, err => console.error('updating content status failed', err));
    this.courseConsumptionService.updateContentState.emit();
  }

  onAssessmentEvents(event) {
    /* istanbul ignore else */
    if (!this.batchId || _.get(this.enrolledBatchInfo, 'status') !== 1) {
      return;
    }
    this.assessmentScoreService.receiveTelemetryEvents(event);
    this.calculateProgress();
    this.assessmentEvents.emit(event);
  }
  onQuestionScoreReviewEvents(event) {
    this.assessmentScoreService.handleReviewButtonClickEvent();
  }
  onQuestionScoreSubmitEvents(event) {
    /* istanbul ignore else */
    if (event) {
      this.assessmentScoreService.handleSubmitButtonClickEvent(true, this.courseType);
      this.contentProgressEvent(event);
    }
  }

  /**
   * @since #SH-120
   * @param  {object} event - telemetry end event data
   * @description - It will return the progress calculated from client-service(Common Consumption)
   */
  private validEndEvent(event) {
    const playerSummary: Array<any> = _.get(event, 'detail.telemetryData.edata.summary');
    const contentMimeType = _.get(this.previousContent, 'mimeType') ? _.get(this.previousContent, 'mimeType') : _.get(this.activeContent, 'mimeType');
    const contentType = _.get(this.previousContent, 'primaryCategory') ? _.get(this.previousContent, 'primaryCategory') : _.get(this.activeContent, 'primaryCategory');
    this.courseProgress = CsContentProgressCalculator.calculate(playerSummary, contentMimeType);
    console.log(_.find(playerSummary, ['endpageseen', true]));
    if (_.toLower(contentType) === 'course assessment') {
      this.courseProgress = _.find(playerSummary, ['endpageseen', true]) ||
        _.find(playerSummary, ['visitedcontentend', true]) ? this.courseProgress : 0;
    }
    return this.courseProgress;
  }

  calculateProgress(isLogAuditEvent?: boolean) {
    /* istanbul ignore else */
    if (this.batchId && _.get(this.courseHierarchy, 'children')) {
      this.consumedContents = 0;
      this.totalContents = 0;
      this.courseHierarchy.children.forEach(unit => {
        if (unit.mimeType === 'application/vnd.ekstep.content-collection') {
          let consumedContents = [];
          let flattenDeepContents = [];

          /* istanbul ignore else */
          if (_.get(unit, 'children.length')) {
            flattenDeepContents = this.courseConsumptionService.flattenDeep(unit.children).filter(item => item.mimeType !== 'application/vnd.ekstep.content-collection');
            /* istanbul ignore else */
            if (this.contentStatus && this.contentStatus.length) {
              consumedContents = flattenDeepContents.filter(o => {
                return this.contentStatus.some(({ contentId, status }) => o.identifier === contentId && status === 2);
              });
            }
          }

          unit.consumedContent = consumedContents.length;
          unit.contentCount = flattenDeepContents.length;
          unit.isUnitConsumed = consumedContents.length === flattenDeepContents.length;
          unit.isUnitConsumptionStart = false;

          if (consumedContents.length) {
            unit.progress = (consumedContents.length / flattenDeepContents.length) * 100;
            unit.isUnitConsumptionStart = true;
          } else {
            unit.progress = 0;
            unit.isUnitConsumptionStart = false;
          }

        } else {
          const consumedContent = this.contentStatus.filter(({ contentId, status }) => unit.identifier === contentId && status === 2);
          unit.consumedContent = consumedContent.length;
          unit.contentCount = 1;
          unit.isUnitConsumed = consumedContent.length === 1;
          unit.progress = consumedContent.length ? 100 : 0;
          unit.isUnitConsumptionStart = Boolean(consumedContent.length);
        }

        this.consumedContents = this.consumedContents + unit.consumedContent;
        this.totalContents = this.totalContents + unit.contentCount;
        this.courseHierarchy.progress = 0;
        /* istanbul ignore else */
        if (this.consumedContents) {
          this.courseHierarchy.progress = (this.consumedContents / this.totalContents) * 100;
        }
        this.isUnitCompleted = this.totalContents === this.consumedContents;
        /* istanbul ignore else */
        if (isLogAuditEvent && this.isUnitCompleted) {
          this.logAuditEvent(true);
        }
      });
    } else {
      this.isUnitCompleted = false;
      if (this.contentStatus && this.contentStatus.length) {
        const contentState = this.contentStatus.filter(({ contentId, status }) =>
          _.get(this.courseHierarchy, 'identifier') === contentId && status === 2);
        if (contentState.length > 0) {
          this.isUnitCompleted = true;
        }
      }
      if (isLogAuditEvent && this.isUnitCompleted) {
        this.logAuditEvent(true);
      }
    }
  }

  private subscribeToContentProgressEvents() {
    return this.contentProgressEvents$.pipe(
      map(event => {
        // this.CourseProgressService.endEventData(event);
        this.contentProgressEvent(event);
        return {
          contentProgressEvent: event
        };
      }),
      takeUntil(this.unsubscribe)
    );
  }

  endEventReached(event: any) {
    this.CourseProgressService.endEventData(event);
  }

  logTelemetry(id, content?: {}, rollup?) {
    if (this.batchId) {
      this.telemetryCdata = [{ id: this.batchId, type: 'CourseBatch' }];
    }
    if (rollup) {
      rollup = { l1: this.courseId };
    }
    const objectRollUp = this.courseConsumptionService.getContentRollUp(this.courseHierarchy, _.get(content, 'identifier'));
    const interactData = {
      context: {
        env: _.get(this.activatedRoute.snapshot.data.telemetry, 'env') || 'content',
        cdata: this.telemetryCdata
      },
      edata: {
        id: id,
        type: 'click',
        pageid: _.get(this.activatedRoute.snapshot.data.telemetry, 'pageid') || 'play-collection',
      },
      object: {
        id: content ? _.get(content, 'identifier') : this.courseId,
        type: content ? _.get(content, 'contentType') : 'Course',
        ver: content ? `${_.get(content, 'pkgVersion')}` : `1.0`,
        rollup: rollup || this.courseConsumptionService.getRollUp(objectRollUp) || {}
      }
    };
    this.telemetryService.interact(interactData);
  }

  private setTelemetryContentImpression() {
    const objectRollUp = this.courseConsumptionService.getContentRollUp(this.courseHierarchy, _.get(this.activeContent, 'identifier'));
    const telemetryContentImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env,
        cdata: this.telemetryCdata
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.router.url,
      },
      object: {
        id: this.activeContent.identifier,
        type: this.activeContent.contentType || 'content',
        ver: this.activeContent.pkgVersion ? this.activeContent.pkgVersion.toString() : '1.0',
        rollup: this.courseConsumptionService.getRollUp(objectRollUp) || {}
      }
    };
    this.telemetryService.impression(telemetryContentImpression);
  }

  private setTelemetryCourseImpression() {
    this.telemetryPlayerPageImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env,
        cdata: this.telemetryCdata
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.router.url,
      },
      object: {
        id: this.courseId || _.get(this.courseHierarchy, 'identifier'),
        type: _.get(this.courseHierarchy, 'contentType') || 'Course',
        ver: `${_.get(this.courseHierarchy, 'pkgVersion')}` || '1.0',
        rollup: { l1: this.courseId }
      }
    };
  }

  logAuditEvent(isUnit?: boolean) {
    const auditEventInput: IAuditEventInput = {
      'context': {
        'env': this.activatedRoute.snapshot.data.telemetry.env,
        'cdata': [
          { id: this.courseId, type: 'CourseId' },
          { id: this.userId, type: 'UserId' },
          { id: this.batchId, type: 'BatchId' },
        ]
      },
      'object': {
        'id': this.batchId,
        'type': this.activatedRoute.snapshot.data.telemetry.object.type,
        'ver': this.activatedRoute.snapshot.data.telemetry.object.ver,
        'rollup': { l1: this.courseId }
      },
      'edata': {
        props: ['courseId', 'userId', 'batchId'],
        state: '',
        prevstate: ''
      }
    };

    if (isUnit) {
      auditEventInput.context.cdata.push({ id: this.courseHierarchy.identifier, type: 'UnitId' });
      auditEventInput.edata.props.push('unitId');
    } else {
      auditEventInput.context.cdata.push({ id: this.activeContent.identifier, type: 'ContentId' });
      auditEventInput.edata.props.push('contentId');
    }

    this.telemetryService.audit(auditEventInput);
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.unsubscribe.next();
      this.unsubscribe.complete();
    }, 1000)
  }

  onShareLink() {
    this.shareLink = this.contentUtilsServiceService.getCourseModulePublicShareUrl(this.courseId, this.collectionId);
    this.setTelemetryShareData(this.courseHierarchy);
  }

  onRatingPopupClose() {
    this.contentRatingModal = false;
    // this.getCourseCompletionStatus(true);
  }

  setTelemetryShareData(param) {
    this.telemetryShareData = [{
      id: param.identifier,
      type: param.contentType,
      ver: param.pkgVersion ? param.pkgVersion.toString() : '1.0'
    }];
  }

  onCourseCompleteClose() {
    this.showCourseCompleteMessage = false;
  }

  highlightContent() {
    if (this.contentStatus && this.contentStatus.length > 0) {
      this.contentStatus.forEach((item) => {
        if (_.get(item, 'contentId') === _.get(this.activeContent, 'identifier') && item.status === 0) {
          item.status = 1;
        }
      });
    }
  }

  getCourseCompletionStatus(showPopup: boolean = false) {
    /* istanbul ignore else */
    if (!this.isCourseCompleted) {
      let maxAttemptsExceeded = false;
      this.showMaxAttemptsModal = false;
      let isLastAttempt = false;
      const req: any = this.getContentStateRequest(this.parentCourse);
      if (_.get(this.activeContent, 'contentType') === 'SelfAssess' || !this.isRouterExtrasAvailable) {
        this.CsCourseService
          .getContentState(req, { apiPath: '/content/course/v1' })
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((_res) => {
            const res = this.CourseProgressService.getContentProgressState(req, _res);
            /* istanbul ignore next*/
            _.forEach(_.get(res, 'content'), (contentState) => {
              if (_.get(contentState, 'contentId') === this.activeContent.identifier) {
                /* istanbul ignore next*/
                if (_.get(contentState, 'score.length') >= _.get(this.activeContent, 'maxAttempts')) { maxAttemptsExceeded = true; }
                if (_.get(this.activeContent, 'maxAttempts') - _.get(contentState, 'score.length') === 1) { isLastAttempt = true; }
                /* istanbul ignore next*/
                if (_.get(this.activeContent, 'contentType') === 'SelfAssess') {
                  /* istanbul ignore next*/
                  const _contentIndex = _.findIndex(this.contentStatus, { contentId: _.get(this.activeContent, 'identifier') });
                  this.contentStatus[_contentIndex]['bestScore'] = _.get(contentState, 'bestScore');
                  this.contentStatus[_contentIndex]['score'] = _.get(contentState, 'score');
                }
              }
            });

            /* istanbul ignore else */
            if (maxAttemptsExceeded && !showPopup) {
              this.showMaxAttemptsModal = true;
              this.showQSExitConfirmation = true;
            } else if (isLastAttempt) {
              this.toasterService.error(_.get(this.resourceService, 'frmelmnts.lbl.selfAssessLastAttempt'));
            } else if (_.get(res, 'content.length')) {
              this.isCourseCompleted = (res.totalCount === res.completedCount);
              if (!this.isCourseCompleted && !res.totalCount) {
                this.isCourseCompleted = res.progress >= 100 ? true : this.isCourseCompleted;
              }
              this.showCourseCompleteMessage = this.isCourseCompleted && showPopup;
              if (this.showCourseCompleteMessage) {
                this.notificationService.fetchNotificationList();
              }
              this.isCourseCompletionPopupShown = this.isCourseCompleted;
            }
            this.calculateProgress();
          }, error => {
            console.log('Content state read CSL API failed ', error);
          });
      } else {
        /* istanbul ignore next*/
        _.forEach(this.contentStatus, (contentState) => {
          /* istanbul ignore next*/
          if (_.get(contentState, 'contentId') === _.get(this.activeContent, 'identifier')) {
            /* istanbul ignore next*/
            if (_.get(contentState, 'score.length') >= _.get(this.activeContent, 'maxAttempts')) { maxAttemptsExceeded = true; }
            if (_.get(this.activeContent, 'maxAttempts') - _.get(contentState, 'score.length') === 1) { isLastAttempt = true; }
          }
        });
        /* istanbul ignore else */
        if (maxAttemptsExceeded) {
          this.showMaxAttemptsModal = true;
          this.showQSExitConfirmation = true;
        } else if (isLastAttempt) {
          this.toasterService.error(_.get(this.resourceService, 'frmelmnts.lbl.selfAssessLastAttempt'));
        } else if (this.contentStatus && this.contentStatus.length) {
          this.isCourseCompleted = (_.get(this._routerStateContentStatus, 'totalCount') === _.get(this._routerStateContentStatus, 'completedCount'));
          this.showCourseCompleteMessage = this.isCourseCompleted && showPopup;
          if (this.showCourseCompleteMessage) {
            this.notificationService.fetchNotificationList();
          }
          this.isCourseCompletionPopupShown = this.isCourseCompleted;
        }
      }
    }
  }

  updatePlayerWithResponse(response, id) {
    const serveiceRef = this.userService.loggedIn ? this.playerService : this.publicPlayerService;
    const objectRollup = this.courseConsumptionService.getContentRollUp(this.courseHierarchy, id);
    this.objectRollUp = objectRollup ? this.courseConsumptionService.getRollUp(objectRollup) : {};
    if (response && response.context) {
      response.context.objectRollup = this.objectRollUp;
    }
    const contentDetails = { contentId: id, contentData: response.questionset };
    this.playerConfig = serveiceRef.getConfig(contentDetails);
    this.publicPlayerService.getQuestionSetRead(id).subscribe((data: any) => {
      this.playerConfig['metadata']['instructions'] = _.get(data, 'result.questionset.instructions');
      this.playerConfig['metadata']['outcomeDeclaration'] = _.get(data, 'result.questionset.outcomeDeclaration');
      this.showPlayer = true;
    }, (error) => {
      this.showPlayer = true;
    });
    this.playerConfig['metadata']['maxAttempt'] = _.get(this.activeContent, 'maxAttempts');
    this.playerConfig['context']['objectRollup'] = this.objectRollUp;
    if (this.questionSetEvaluable) {
      let attemptKey = 'currentAttempt_' + this.courseId;
      this.playerConfig['metadata']['currentAttempt'] = localStorage.getItem(attemptKey) == undefined ? 0 : JSON.parse(localStorage.getItem(attemptKey));
    } else {
      let attemptKey = 'currentAttempt_' + id;
      this.playerConfig['metadata']['currentAttempt'] = localStorage.getItem(attemptKey) == undefined ? 0 : JSON.parse(localStorage.getItem(attemptKey));
    }
  }

  private initPlayer(id: string) {
    let maxAttemptsExceeded = false;
    this.showMaxAttemptsModal = false;
    let isLastAttempt = false;
    /* istanbul ignore if */
    if (_.get(this.activeContent, 'contentType') === 'SelfAssess') {
      const _contentIndex = _.findIndex(this.contentStatus, { contentId: _.get(this.activeContent, 'identifier') });
      /* istanbul ignore if */
      if (_contentIndex > 0 && _.get(this.contentStatus[_contentIndex], 'score.length') >= _.get(this.activeContent, 'maxAttempts')) { maxAttemptsExceeded = true; }
      if (_contentIndex > 0 && _.get(this.activeContent, 'maxAttempts') - _.get(this.contentStatus[_contentIndex], 'score.length') === 1) { isLastAttempt = true; }
    }
    /* istanbul ignore if */
    if (maxAttemptsExceeded) {
      this.showMaxAttemptsModal = true;
      this.showQSExitConfirmation = true;
    } else {
      /* istanbul ignore if */
      if (isLastAttempt && !this.showLastAttemptsModal && this._routerStateContentStatus) {
        this.toasterService.error(_.get(this.resourceService, 'frmelmnts.lbl.selfAssessLastAttempt'));
      }
      this.assessmentScoreService.init({
        batchDetails: this.enrolledBatchInfo,
        courseDetails: this.courseHierarchy,
        contentDetails: { identifier: id }
      });
      const options: any = { courseId: this.collectionId };
      /* istanbul ignore else */
      if (this.batchId) {
        options.batchId = this.batchId;
      }
      if (this.activeContent?.mimeType === this.configService.appConfig.PLAYER_CONFIG.MIME_TYPE.questionset) {
        const serveiceRef = this.userService.loggedIn ? this.playerService : this.publicPlayerService;
        this.courseEvaluable = this.serverValidationCheck(this.activeContent?.evalMode);
        if (this.courseEvaluable) {
          this.attemptID = this.assessmentScoreService.generateHash();
          const requestBody = {
            request: {
              questionset: {
                contentID: id,
                collectionID: this.courseHierarchy.identifier,
                userID: this.userId,
                attemptID: this.attemptID
              }
            }
          }
          this.publicPlayerService.getQuestionSetHierarchyByPost(requestBody).pipe(
            takeUntil(this.unsubscribe))
            .subscribe((response) => {
              //Call below method for sending questionSetToken in content state update api if eval mode is server
              this.questionSetEvaluable = this.serverValidationCheck(response.questionset?.evalMode);
              this.assessmentScoreService.setServerEvaluableFields(this.questionSetEvaluable, response.questionset.questionSetToken, this.attemptID);
              this.updatePlayerWithResponse(response, id);
              this.showLoader = false;
            }, (err) => {
              this.toasterService.error(this.resourceService.messages.stmsg.m0009);
              this.showLoader = false;
            });
        } else {
          this.publicPlayerService.getQuestionSetHierarchy(id).pipe(
            takeUntil(this.unsubscribe))
            .subscribe((response) => {
              this.questionSetEvaluable = this.serverValidationCheck(response.questionset?.evalMode);
              this.assessmentScoreService.setServerEvaluableFields(this.questionSetEvaluable, response.questionset?.questionSetToken, '');
              this.updatePlayerWithResponse(response, id);
              this.showLoader = false;
            }, (err) => {
              this.toasterService.error(this.resourceService.messages.stmsg.m0009);
              this.showLoader = false;
            });
        }
      } else {
        this.courseConsumptionService.getConfigByContent(id, options)
          .pipe(first(), takeUntil(this.unsubscribe))
          .subscribe(config => {
            this.showPlayer = true;
            const objectRollup = this.courseConsumptionService.getContentRollUp(this.courseHierarchy, id);
            this.objectRollUp = objectRollup ? this.courseConsumptionService.getRollUp(objectRollup) : {};
            if (config && config.context) {
              config.context.objectRollup = this.objectRollUp;
            }
            this.playerConfig = config;
            let consumedData: any = this.CourseProgressService.contentProgress['content_' + `${this.selectedContentId}`];
            if ((consumedData?.length > 0 || this.visitedData?.length > 0) && this.playerConfig.metadata.mimeType == 'application/pdf') {
              if (consumedData?.length > 0) {
                this.playerConfig.config.pagesVisited = consumedData;
              } else {
                this.playerConfig.config.pagesVisited = this.visitedData;
              }
            } else if ((consumedData?.length > 0 || this.visitedData?.length > 0) && this.playerConfig.metadata.mimeType == 'video/mp4') {
              if (consumedData?.length > 0) {
                this.playerConfig.config.currentDuration = consumedData[0];
              } else {
                this.playerConfig.config.currentDuration = this.visitedData[0]
              }
            }
            const _contentIndex = _.findIndex(this.contentStatus, { contentId: _.get(config, 'context.contentId') });
            this.playerConfig['metadata']['maxAttempt'] = _.get(this.activeContent, 'maxAttempts');
            const _currentAttempt = _contentIndex > 0 ? _.get(this.contentStatus[_contentIndex], 'score.length') : 0;
            this.playerConfig['metadata']['currentAttempt'] = _currentAttempt == undefined ? 0 : _currentAttempt;
            this.showLoader = false;
            this.setTelemetryContentImpression();
          }, (err) => {
            this.showLoader = false;
            this.toasterService.error(this.resourceService.messages.stmsg.m0009);
          });
      }
    }
  }

  serverValidationCheck(mode: any) {
    // if(typeof obj == 'string') {
    //   this.questionSetEvaluable = JSON.parse(obj);
    //   this.questionSetEvaluable = this.questionSetEvaluable?.mode?.toLowerCase() == 'server'
    // } else {
    //   this.questionSetEvaluable = obj?.mode?.toLowerCase() == 'server'
    // }
    if (mode == 'server') {
      this.questionSetEvaluable = true;
      return this.questionSetEvaluable;
    } else {
      this.questionSetEvaluable = false;
      return this.questionSetEvaluable
    }
  }

  onSelfAssessLastAttempt(event) {
    if (_.get(event, 'data') === 'renderer:selfassess:lastattempt' || _.get(event, 'edata.isLastAttempt')) {
      this.toasterService.error(_.get(this.resourceService, 'frmelmnts.lbl.selfAssessLastAttempt'));
    }
    if (_.get(event, 'data') === 'renderer:maxLimitExceeded' || _.get(event, 'edata.maxLimitExceeded')) {
      this.showMaxAttemptsModal = true;
      this.showQSExitConfirmation = true;
    }
  }
  routerEventsChangeHandler() {
    return this.router.events
      .pipe(
        takeUntil(this.unsubscribe),
        tap(event => {
          if (event instanceof NavigationStart) {
            const isH5pContent = [_.get(this.playerConfig, 'metadata.mimeType'), _.get(this.activeContent, 'mimeType')].every(mimeType => mimeType === 'application/vnd.ekstep.h5p-archive');
            if (isH5pContent) {
              this.contentRatingModal = true;
            }
          }
        })
      )
  }

  updateCourseContent() {
    let content = this.courseConsumptionService.getCourseContent();
    this.tocList = content;
    // if(content?.length > 0) {
    //   if(this.batchId) {
    //     this.tocList = content;
    //   } else {
    //     let filteredContent: any;
    //     content.forEach((c)=> {
    //       let body = c.body.find((val) => {
    //         return val.collectionId == this.parentContentId;
    //       });
    //       if(body) {
    //         c.body = [];
    //         c.body.push(body);
    //         filteredContent = c;
    //       }
    //     });
    //     //Below condition should be removed after batch availablity functionality complete
    //     if(filteredContent) {
    //       this.tocList.push(filteredContent);
    //     } else {
    //       this.tocList = content;
    //     }
    //   }

    //   console.log("tocList", this.tocList);
    // }
  }

  contentClicked(event: any, id: string) {
    this.navigationObj = {
      event: {
        data: event.content.children,
      },
      id: id
    };
    if (this.courseConsumptionService.courseHierarchy.primaryCategory.toLowerCase() == 'assessment') {
      let attemptKey = 'currentAttempt_' + this.courseId;
      let getAttemptId = localStorage.getItem(attemptKey) == undefined ? 0 : JSON.parse(localStorage.getItem(attemptKey));
      localStorage.setItem(attemptKey, getAttemptId + 1);
    } else if (event.content.mimeType == 'application/vnd.sunbird.questionset') {
      let attemptKey = 'currentAttempt_' + event.content.selectedContent;
      let getAttemptId = localStorage.getItem(attemptKey) == undefined ? 0 : JSON.parse(localStorage.getItem(attemptKey));
      localStorage.setItem(attemptKey, getAttemptId + 1);
    }
    this.contentTitle = event.header.title;
    const module = this.courseConsumptionService.setPreviousAndNextModule(this.parentCourse, event.content.collectionId);
    this.nextModule = _.get(module, 'next');
    this.prevModule = _.get(module, 'prev');
    this.onTocCardClick();
  }

  hideSection() {
    this.isSectionVisible = false;
  }

  // mimeType(type: string) {
  //   this.courseConsumptionService.setmimeType(type)
  // }


}