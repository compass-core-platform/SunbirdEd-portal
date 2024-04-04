import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BatchParticipantService } from '../../services/course-batch/batch.service';
import { UserService, PublicDataService, LearnerService} from '@sunbird/core';
import { ConfigService, ResourceService } from '@sunbird/shared';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { FormControl } from '@angular/forms';

export interface CourseData {
  id: string;
  initials:string;
  name: string;
  designation:string;
  enrolledData: string;
  progress: number;
  link: any;
}

@Component({
  selector: 'app-batch-progress-details',
  templateUrl: './batch-progress-details.component.html',
  styleUrls: ['./batch-progress-details.component.scss']
})
export class BatchProgressDetailsComponent implements OnInit {
  courseDetails: any = {};
  memberList: any[];
  authToken : [];
  displayColumns = ['initials', 'name', 'designation', 'department','progress'];
  breadCrumbData = [{
    label: this.resourceService.frmelmnts.breadcrumbs.courses,
    "status": "",
    "icon": "list",
    "link": "/learn/batch-progress"
  }];
  search:string = '';
  startDate = new FormControl();
  endDate = new FormControl();
  showDatedropdown = false;
  statusList = ['All members', 'Completed', 'Not started'];
  status = new FormControl('');
  dateRange;
  updatedMemberList = [];

  constructor(private route: ActivatedRoute, 
    private courseBatchService: BatchParticipantService, 
    private publicDataService: PublicDataService,
    private learnerService: LearnerService,
    private configService: ConfigService,
    private userSerivce: UserService, private httpClient: HttpClient,
    private resourceService: ResourceService) {
   }

  ngOnInit(): void {
    console.log("Batch Progress Component");
    this.memberList = [];
   this.route.queryParamMap.subscribe((pa:any) => {
      this.courseDetails.name = pa.params.name;
      this.breadCrumbData[0].label = pa.params.primaryCategory;
      this.breadCrumbData.push({
        label: this.courseDetails.name,
        "status": "active",
        "icon": "",
        "link": ""
      })
    });
    this.route.params.subscribe(param => {
      this.courseDetails.id = param.courseId;
      this.courseDetails.batchId = param.batchId;
      this.getBatchParticipentList();
    });
  }

  getBatchParticipentList(){
    const req = {
      request: {
          batch: {
              "batchId": this.courseDetails.batchId
          }
      }
    }
    this.courseBatchService.getParticipantList(req).subscribe((res:any) => {
      console.log(res);
     if(res.length>0) {
        const requestBody =  {
          request: {
            filters: {
                userId: [
                    ...res
                ]
              },
            query:this.search.length>0?this.search:'',
          }
        }
        this.userSerivce.getEnrolledUsers(requestBody).subscribe((memResponse:any) => {
              if(memResponse.length>0) {
                this.memberList = memResponse.map((m:any) => {
                  return {
                    initials:`${m.firstName[0]}${m.lastName[0] ? m.lastName[0] : ''}`,
                    name: m.firstName+' '+m.lastName,
                    designation:m.profileDetails?.professionalDetails.length>0?m.profileDetails.professionalDetails[0].designation : '',
                    department:m.profileDetails?.employmentDetails.hasOwnProperty('departmentName')?m.profileDetails.employmentDetails.departmentName : '',
                    progress: 0
                  }
                })
                this.updateProgress(res,memResponse);
             }
        })
     }
    })
  }

  updateProgress(res, memResponse) {
    this.updatedMemberList = [];
    let filteredCourseList = [];
    const option = {
      url: this.configService.urlConFig.URLS.COURSE.COURSE_USERS,
      data: { 
        request: {
          filters: {
            "courseIds": [this.courseDetails.id],
           },
           "userIds": [...res]
        }
      }
    }
    this.learnerService.post(option).subscribe((courseList:any) => {
        filteredCourseList = courseList.result.courses.filter((c:any) => c.courseId === this.courseDetails.id);
        this.updatedMemberList = memResponse.map((m:any) => {
            const perValue = filteredCourseList.filter((cos:any) => cos.userId === m.id);
        return {
              initials:`${m.firstName[0]}${m.lastName[0] ? m.lastName[0] : ''}`,
              name: m.firstName+' '+m.lastName,
              designation:m.profileDetails?.professionalDetails.length>0?m.profileDetails.professionalDetails[0].designation : '',
              department:m.profileDetails?.employmentDetails.hasOwnProperty('departmentName')?m.profileDetails.employmentDetails.departmentName : '',
              progress:perValue.length>0? perValue[0].completionPercentage : 0
            }
          });
          this.memberList = [...this.updatedMemberList];
    });
  }

  OnDateChange(e) {
    console.log(this.startDate.value.format('DD/MM/yyyy'));
    console.log(this.endDate.value.format('DD/MM/yyyy'));
  }

  onPageChange(e){
    console.log(e);
  }

  onSelect(event:any) {
    let filtedList = [];
      switch(event) {
      case 'Not started' :  filtedList = this.updatedMemberList.filter(m => m.progress === 0);
                            console.log(filtedList);
                              break;
      case 'Completed' :    filtedList = this.updatedMemberList.filter(m => m.progress === 100);
                              console.log(filtedList);
                              break;
      case 'All members' :  filtedList = this.updatedMemberList; 
                              console.log(filtedList);
                              break;
      default:break;         
    }
    this.memberList = [...filtedList];
  }

  searchQuery() {
    this.getBatchParticipentList();
  }

  bulkDateFilter(data) {
    switch(data) {
      case 'today': let dateRange = new Date().toUTCString();
                    console.log(new Date(dateRange).toLocaleDateString());
                      break;
      case 'tomorrow': let currentDate = new Date().toUTCString();
                       let dateR = new Date(currentDate).setDate(new Date(currentDate).getDate()+1);
                       console.log(new Date(dateR).toLocaleDateString());
                       break;
      case 'current-month': console.log(this.convertpastDate(0))
                            break;
      case 'past-month': console.log(this.convertpastDate(1))
                          break;
      case 'past-3-month': console.log(this.convertpastDate(3))
                          break;
      default:break;
    }
  }

  convertpastDate(numberofMonth) {
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();
    let firstDay = new Date(y, m - numberofMonth, 1);
    let lastDay = new Date(y, m, 0);
    return {firstDay:firstDay, lastDay: lastDay};
  }


}
