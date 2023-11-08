import { Component, Input, OnInit, Inject, SimpleChange, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import * as _ from 'lodash-es';
import { CourseConsumptionService, CourseProgressService } from '../../../services';
import { CoursesService, UserService } from '@sunbird/core';
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {ResourceService, ToasterService, IUserData} from '@sunbird/shared';
import { CsCertificateService } from '@project-sunbird/client-services/services/certificate/interface';
import { CertificateDownloadAsPdfService } from 'sb-svg2pdf-v13';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-aside',
  templateUrl: './course-aside.component.html',
  styleUrls: ['./course-aside.component.scss'],
  providers: [CertificateDownloadAsPdfService]
})
export class CourseAsideComponent implements OnInit {
  @Input() courseHierarchy:any;
  @Input() configContent:any;
  @Input() params: any;

  firstContentId: any;
  parentId: any;
  batchId: any;
  courseStatus:number;
  public unsubscribe$ = new Subject<void>();
  firstModule:any;
  userSubscription: Subscription;
  userProfile: any;
  otherCertificates: Array<object>;
  otherCertificatesCounts: number;

  constructor(private router: Router, private courseConsumptionService: CourseConsumptionService,
     private userService: UserService,  public courseProgressService: CourseProgressService, public resourceService: ResourceService, public toasterService: ToasterService,
     private certDownloadAsPdf: CertificateDownloadAsPdfService, @Inject('CS_CERTIFICATE_SERVICE') private CsCertificateService: CsCertificateService,
     @Inject('CS_COURSE_SERVICE') private courseCService: CsCourseService) { }

  ngOnInit(): void {
    this.firstModule = this.courseConsumptionService.getCourseContent()[0];
    // console.log('courseHierarchy', this.courseHierarchy);
    this.firstContentId = this.firstModule.body[0].selectedContent;
    this.parentId = this.firstModule.body[0].collectionId;
    this.courseProgressService.courseStatus.subscribe((status:number) => {
      // alert(status);
      this.courseStatus = status
      // this.courseStatus = 2
    })

    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      /* istanbul ignore else */
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        this.getOtherCertificates(_.get(this.userProfile, 'userId'), 'all');
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
    if(changes?.params?.currentValue) {
      this.batchId = changes.params.currentValue;
    }
  }

  downloadOldAndRCCert() {
    console.log('downloadOldAndRCCert', this.firstModule);
    let courseObj:any;
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
      .subscribe((resp) => {
        if (_.get(resp, 'printUri')) {
          this.certDownloadAsPdf.download(resp.printUri, null, courseObj.trainingName);
        } else {
          this.toasterService.error(this.resourceService.messages.emsg.m0076);
        }
      }, error => {
        console.log('Portal :: CSL : Download certificate CSL API failed ', error);
      });
  }

  navigate() {
    // this.router.navigate(['/learn/course/play',this.courseHierarchy.identifier]);
    if(!this.courseConsumptionService.isUserExistInBatch()){
      this.courseConsumptionService.enrollToCourse(this.courseHierarchy);
    }
    this.router.navigate(['/learn/course/play',this.parentId],
    { 
      queryParams: { 
        batchId: this.batchId || this.courseConsumptionService.getBatchId(),
        courseId: this.courseHierarchy.identifier,
        courseName: this.courseHierarchy.name,
        selectedContent: this.firstContentId,
        parent: this.parentId
      } 
    });
  }

  saveCourseRating(courseId: string) {
    let data: any = {
      activityId: this.courseHierarchy.identifier,
      userId: "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
      activityType: "Course",
      rating: 4,
      review: "good course"
  };
    this.courseConsumptionService.saveCourseRating(data).subscribe((res: any) => {
      // console.log('Rating', res);
    
    });
  }
}
