import { Component, Input, OnInit } from '@angular/core';
import { FrameworkService } from '@sunbird/core';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.scss']
})
export class CourseOverviewComponent implements OnInit {

  @Input() courseDetails: any;
  @Input() configContent: any;
  @Input() params: any
  associatedTerms = [];
  categoryTermsIdLevels:any
  competencylevels: any;
  levelsInfo = {
    header:{
      content: '',
      level: ''
    },
    data: []
  }
  categoryTermsId: any;
  associatedCompetencies:[];

  constructor(private framework: FrameworkService) { }

  ngOnChanges(){
    this.levelsInfo.header.content = this.configContent.overview.competencyType;
    this.levelsInfo.header.level = this.configContent.overview.level;
  }
  ngOnInit(): void {
    this.categoryTermsId = this.courseDetails.se_subjectIds || this.courseDetails.targetTaxonomyCategory4Ids;
    this.categoryTermsIdLevels = this.courseDetails.targetTaxonomyCategory5Ids;
    if(this.categoryTermsId){
      this.framework.getSelectedFrameworkCategories(this.courseDetails.targetFWIds[0]).subscribe((res:any) => {
        if(res.result.framework.categories.length>3) {
         this.associatedCompetencies = res.result.framework.categories[3].terms.filter((term:any) => this.categoryTermsId.includes(term.identifier))
          this.competencylevels = res.result.framework.categories[4].terms.filter((term:any) => this.categoryTermsIdLevels.includes(term.identifier))
         this.updateLevelInfo();
        }
      }) 
    }
  }

  updateLevelInfo(){
    this.levelsInfo['data'] = [ ...this.associatedCompetencies.map((com:any) => {
      return {
          content: com.name,
          level:   this.competencylevels[0].index
      }
    })]
  }
}
