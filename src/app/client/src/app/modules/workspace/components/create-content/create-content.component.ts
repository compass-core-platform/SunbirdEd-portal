import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ResourceService, ConfigService, NavigationHelperService } from '@sunbird/shared';
import { FrameworkService, PermissionService, UserService,SearchService } from '@sunbird/core';
import { IImpressionEventInput } from '@sunbird/telemetry';
import { WorkSpaceService } from './../../services';
@Component({
  selector: 'app-create-content',
  templateUrl: './create-content.component.html',
  styleUrls: ['./create-content.component.scss']
})
export class CreateContentComponent implements OnInit, AfterViewInit {

  /*
 roles allowed to create textBookRole
 */
  textBookRole: Array<string>;
  /**
    * lessonRole   access roles
  */
  lessonRole: Array<string>;
  /**
 * collectionRole  access roles
 */
  collectionRole: Array<string>;
  /**
  *  lessonplanRole access roles
  */
  lessonplanRole: Array<string>;
  /**
  *  lessonplanRole access roles
  */
  contentUploadRole: Array<string>;
  /**
   * courseRole  access roles
  */
  courseRole: Array<string>;
 /**
   * assesment access role
   */
  assessmentRole: Array<string>;
  /**
   * To call resource service which helps to use language constant
   */
  public resourceService: ResourceService;
  /**
   * Reference for framework service
  */
  public frameworkService: FrameworkService;

  /**
   * reference of permissionService service.
  */
  public permissionService: PermissionService;
  /**
  * reference of config service.
 */
  public configService: ConfigService;
  /**
	 * telemetryImpression
	*/
  telemetryImpression: IImpressionEventInput;
  public enableQuestionSetCreation;
  /**
  * Constructor to create injected service(s) object
  *
  * Default method of DeleteComponent class

  * @param {ResourceService} resourceService Reference of ResourceService
 */
  metricsData: any[];
  sequence = ['Course', 'Assessment', 'Learning Resource', 'Practice Question Set'];

  constructor(configService: ConfigService, resourceService: ResourceService,
    frameworkService: FrameworkService, permissionService: PermissionService,
    private activatedRoute: ActivatedRoute, public userService: UserService,
    public navigationhelperService: NavigationHelperService,
    public workSpaceService: WorkSpaceService,
    private searchService: SearchService) {
    this.resourceService = resourceService;
    this.frameworkService = frameworkService;
    this.permissionService = permissionService;
    this.configService = configService;
  }

  ngOnInit() {
    this.frameworkService.initialize();
    this.textBookRole = this.configService.rolesConfig.workSpaceRole.textBookRole;
    this.lessonRole = this.configService.rolesConfig.workSpaceRole.lessonRole;
    this.collectionRole = this.configService.rolesConfig.workSpaceRole.collectionRole;
    this.lessonplanRole = this.configService.rolesConfig.workSpaceRole.lessonplanRole;
    this.contentUploadRole = this.configService.rolesConfig.workSpaceRole.contentUploadRole;
    this.assessmentRole = this.configService.rolesConfig.workSpaceRole.assessmentRole;
    this.courseRole = this.configService.rolesConfig.workSpaceRole.courseRole;
    this.workSpaceService.questionSetEnabled$.subscribe(
      (response: any) => {
        this.enableQuestionSetCreation = response.questionSetEnablement;
      }
    );
    this.getInsightDashboardData();
  }



  ngAfterViewInit () {
    setTimeout(() => {
      this.telemetryImpression = {
        context: {
          env: this.activatedRoute.snapshot.data.telemetry.env
        },
        edata: {
          type: this.activatedRoute.snapshot.data.telemetry.type,
          pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
          uri: this.activatedRoute.snapshot.data.telemetry.uri,
          duration: this.navigationhelperService.getPageLoadTime()
        }
      };
    });
  }

  getInsightDashboardData() {
    const payload= {
      "request": {
          "limit": 10000,
          "filters": {
              "status": [
                  "Draft",
                  "Review",
                  "Live"
              ],
              "createdBy": this.userService.userid,
              "primaryCategory": [
                  "Learning Resource",
                  "Practice Question Set",
                  "Course",
                  "Assessment"
              ]
           }
      }
    }
    this.searchService.getInsightsMetric(payload).subscribe((res: any) => {
      if(res.result.metrics?.length > 0) {
        let response = res.result.metrics;

        //Sort array in required format
        this.metricsData = response.sort((a, b) => {
          return this.sequence.indexOf(a.primaryCategory) - this.sequence.indexOf(b.primaryCategory);
        });

        //Replace names for title accordingly
        response.forEach((data: any) => {
          if(data.primaryCategory == 'Learning Resource') {
            data.primaryCategory = this.resourceService?.frmelmnts?.workspace?.resource;
          } else if(data.primaryCategory == 'Practice Question Set') {
            data.primaryCategory = this.resourceService?.frmelmnts?.workspace?.questionset;
          } else if(data.primaryCategory == 'Course') {
            data.primaryCategory = this.resourceService?.frmelmnts?.workspace?.course;
          } else {
            data.primaryCategory = this.resourceService?.frmelmnts?.workspace?.assessment;
          }
        });
      }
    });
  }
}
