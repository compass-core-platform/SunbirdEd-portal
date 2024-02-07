import { Component, Input, OnInit } from '@angular/core';
import { CoursesService, UserService } from '@sunbird/core';
import { CourseBatchService, CourseConsumptionService } from './../../../services';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit {
  @Input() courseHierarchy:any;
  @Input() configContent:any;
  batchList = [];
  
  constructor(private courseBatchService: CourseBatchService, private courseService: CoursesService,
    private courseConsumptionService : CourseConsumptionService, private userSerivce: UserService) { }

  ngOnInit(): void {
   this.getEnrollerMembers();
  }
  
  getEnrollerMembers() {
        let batchId = this.courseHierarchy.batches[0].batchId;
        const requestBody = {
          request: {
              batch: {
                  "batchId": batchId
              }
          }
        }
      this.courseBatchService.getParticipantList(requestBody).subscribe((res:any) => {
        if(res.length>0){
          this.courseConsumptionService.setBatchList(res);
        const requestBody =  {
              request: {
                filters: {
                    userId: [
                        ...res
                    ]
                  }
              }
            }
            this.userSerivce.getEnrolledUsers(requestBody).subscribe((memResponse:any) => {
                  if(memResponse.length>0){
                    this.batchList = memResponse.map((mem:any) => {
                      mem.fullName = mem.firstName+' '+mem.lastName;
                      return mem;
                    })
                  }
            })
        }
      })
    }
}
