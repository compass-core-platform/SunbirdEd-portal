import { Component, Input, OnInit, Inject, SimpleChange, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import * as _ from 'lodash-es';
import { CourseConsumptionService, CourseProgressService } from '../../../services';
import { CoursesService, UserService } from '@sunbird/core';
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ResourceService, ToasterService, IUserData } from '@sunbird/shared';
import { CsCertificateService } from '@project-sunbird/client-services/services/certificate/interface';
import { CertificateDownloadAsPdfService } from 'compass-svg2pdf';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-aside',
  templateUrl: './course-aside.component.html',
  styleUrls: ['./course-aside.component.scss'],
  providers: [CertificateDownloadAsPdfService]
})
export class CourseAsideComponent implements OnInit {
  @Input() courseHierarchy: any;
  @Input() configContent: any;
  @Input() params: any;
  @Output() ratingUpdation: EventEmitter<boolean> = new EventEmitter();

  firstContentId: any;
  parentId: any;
  batchId: any;
  courseStatus: number;
  public unsubscribe$ = new Subject<void>();
  firstModule: any;
  userSubscription: Subscription;
  userProfile: any;
  otherCertificates: Array<object>;
  otherCertificatesCounts: number;
  resumeContent: any;
  courseContent: any;
  showRatingModal = false;
  rating: number = 0;
  resultMessage: string = '';
  instructorRating: number = 0;
  contentRating: number = 0;
  engagementRating: number = 0;
  assessmentRating: number = 0;
  courseBatchCompletetion = 0;
  impactScore= 0;
  reviewValue: string;
  ratings: any;

  constructor(private router: Router, private courseConsumptionService: CourseConsumptionService,
    private userService: UserService, public courseProgressService: CourseProgressService, public resourceService: ResourceService, public toasterService: ToasterService,
    private certDownloadAsPdf: CertificateDownloadAsPdfService, @Inject('CS_CERTIFICATE_SERVICE') private CsCertificateService: CsCertificateService,
    @Inject('CS_COURSE_SERVICE') private courseCService: CsCourseService) { }

  ngOnInit(): void {
    console.log("rating header", this.resourceService?.frmelmnts?.toc?.overview?.ratingHeader);
    this.firstModule = this.courseConsumptionService.getCourseContent()[0];
    // console.log('courseHierarchy', this.courseHierarchy);
    this.firstContentId = this.firstModule.body[0].selectedContent;
    this.courseContent = this.courseConsumptionService.getCourseContent();
    this.resumeContent = this.courseContent[0].body[0].selectedContent;
    this.parentId = this.courseContent[0].body[0].collectionId;
    this.courseProgressService.courseStatus.subscribe((status: number) => {
      // alert(status);
      this.courseStatus = 2
    });
    //set selected content Id with last visited contentId
    this.courseProgressService.getLastReadContent().subscribe((resumeContent: any) => {
      if (resumeContent !== '' && resumeContent) {
        this.courseContent.forEach((resource: any) => {
          resource.body.forEach((content: any) => {
            if (content.selectedContent == resumeContent) {
              this.parentId = content.collectionId;
              this.resumeContent = content.selectedContent;
            }
          })
        })
      }
    })

    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      /* istanbul ignore else */
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        this.getOtherCertificates(_.get(this.userProfile, 'userId'), 'all');
      }
    });
    this.getCourseRatings();
    
  }

  getCourseRatings(){
    this.courseConsumptionService.getCourseRatings(this.courseHierarchy['identifier']).subscribe((res: any) => {
      this.ratings = res['result']['response'];
      // this.ratings = {
      //   "activityId": "do_1139217248457031681127",
      //   "commentUpdatedOn": null,
      //   "commentBy": null,
      //   "review": "shoaib testing four",
      //   "rating": 4.0,
      //   "comment": null,
      //   "updatedOn": "2024-01-22T12:31:04.206+0000",
      //   "activityType": "Course",
      //   "userId": "cc87012e-ee59-451d-9ccd-50c0ca5a8cba",
      //   "createdOn": "2023-11-10T08:54:33.461+0000",
      //   "instructorquality": 4.0,
      //   "contentrelevance": 4.0,
      //   "courseengagement": 4.0,
      //   "assessmentsquality": 4.0,
      //   "recommended": null
      // };
      if (this.ratings != null) {
        this.instructorRating = this.ratings['instructorquality'];
        this.contentRating = this.ratings['contentrelevance'];
        this.engagementRating = this.ratings['courseengagement'];
        this.assessmentRating = this.ratings['assessmentsquality'];
        this.reviewValue = this.ratings['review'];
      }
    });
  }
  /**
  * @param userId
  *It will fetch certificates of user, other than courses
  */
  getOtherCertificates(userId, certType) {
    this.otherCertificates = [];
    let requestBody = { userId: userId, schemaName: 'certificate' };
    if (this.otherCertificatesCounts) {
      requestBody['size'] = this.otherCertificatesCounts;
    } else {
      requestBody['size'] = 100;
    }
    this.CsCertificateService.fetchCertificates(requestBody, {
      apiPath: '/learner/certreg/v2',
      apiPathLegacy: '/certreg/v1',
      rcApiPath: '/learner/rc/${schemaName}/v1',
    }).subscribe((_res) => {
      // alert(_res?.certificates?.length);
      if (_res && _res?.certificates?.length > 0) {
        this.otherCertificates = _.get(_res, 'certificates');
        // console.log('Other certificates', this.otherCertificates);
        this.otherCertificatesCounts = (_.get(_res, 'certRegCount') ? _.get(_res, 'certRegCount') : 0) + (_.get(_res, 'rcCount') ? _.get(_res, 'rcCount') : 0);
      }
    }, (error) => {
      this.toasterService.error(this.resourceService.messages.emsg.m0005);
      console.log('Portal :: CSL : Fetch certificate CSL API failed ', error);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.params?.currentValue) {
      this.batchId = changes.params.currentValue;
    }
    this.courseConsumptionService.courseBatchProgress.subscribe((res:any) => {
      this.courseBatchCompletetion =Math.round(Number((res.result.courseCompletionPercentage)));
      this.impactScore =Math.round(Number((res.result.impactScore)));
    })
  }

  downloadOldAndRCCert() {
    console.log('downloadOldAndRCCert', this.firstModule);
    let courseObj: any;
    for (let i = 0; i < this.otherCertificates.length; i++) {
      if (this.otherCertificates[i]['courseId'] == this.courseHierarchy['identifier']) {
        courseObj = this.otherCertificates[i];
      }
    }
    let requestBody = {
      certificateId: courseObj['id'],
      schemaName: 'certificate',
      type: courseObj['type'],
      templateUrl: courseObj['templateUrl']
    };
    this.CsCertificateService.getCerificateDownloadURI(requestBody, {
      apiPath: '/learner/certreg/v2',
      apiPathLegacy: '/certreg/v1',
      rcApiPath: '/learner/rc/${schemaName}/v1',
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (resp) => {
        if (_.get(resp, 'printUri')) {
          let status: any = await this.certDownloadAsPdf.download(resp.printUri, null, courseObj.trainingName);
          if(!status.hasOwnProperty('__zone_symbol__state')) {
            this.toasterService.success(this.resourceService.frmelmnts.cert.lbl.certDownloadSuccess);
          }
        } else {
          this.toasterService.error(this.resourceService.messages.emsg.m0076);
        }
      }, error => {
        console.log('Portal :: CSL : Download certificate CSL API failed ', error);
      });
  }

  navigate() {
    // this.router.navigate(['/learn/course/play',this.courseHierarchy.identifier]);
    if (!this.courseConsumptionService.isUserExistInBatch()) {
      this.courseConsumptionService.enrollToCourse(this.courseHierarchy);
    }
    this.router.navigate(['/learn/course/play', this.parentId],
      {
        queryParams: {
          batchId: this.batchId || this.courseConsumptionService.getBatchId(),
          courseId: this.courseHierarchy.identifier,
          courseName: this.courseHierarchy.name,
          selectedContent: this.resumeContent,
          parent: this.parentId,
          courseType: this.courseHierarchy.primaryCategory
        }
      });
  }

  saveCourseRating(courseId: string) {
    let data: any = {
      activityId: this.courseHierarchy.identifier,
      userId: _.get(this.userProfile, 'userId'),
      activityType: "Course",
      instructorQuality: this.instructorRating,
      contentRelevance: this.contentRating,
      courseEngagement: this.engagementRating,
      assessmentsQuality: this.assessmentRating,
      review: this.reviewValue
    };
    if (data.instructorQuality == 0 || data.contentRelevance == 0 || data.courseEngagement == 0 || data.assessmentsQuality == 0 || data.review == '' || !data.review) {
      this.toasterService.error('Ratings or review cannot be empty!');
    } else {
      this.courseConsumptionService.saveCourseRating(data).subscribe((res: any) => {
        this.toasterService.success('Ratings added successfully!');
        this.showRatingModal = false;
        (<HTMLInputElement>document.getElementById("review")).value = '';
        this.getCourseRatings();
        this.ratingUpdation.emit(true);
      });
    }
  }

  displayRatingModal() {
    if (this.courseStatus > 1) {
      this.showRatingModal = true;
    }
  }

  getPercentageCompleted() {
    if (this.courseConsumptionService.AvgPercentage) {
      return this.courseConsumptionService.AvgPercentage;
    }
    return 0;
  }

  getResultMessage() {
    if (this.courseProgressService.resultMessage) {
      this.resultMessage = this.courseProgressService.resultMessage;
      return '- ' + this.resultMessage;
    }
    this.resultMessage = '';
    return this.resultMessage;
  }
}
