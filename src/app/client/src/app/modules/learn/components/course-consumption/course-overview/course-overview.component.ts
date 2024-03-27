import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FrameworkService } from '@sunbird/core';
import { floor, iteratee } from 'lodash';
import { CourseConsumptionService } from './../../../services';
import { ResourceService } from '@sunbird/shared';


@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.scss']
})
export class CourseOverviewComponent implements OnInit {

  @Input() courseDetails: any;
  @Input() configContent: any;
  @Input() params: any;
  @Output() ratingUpdation: EventEmitter<boolean> = new EventEmitter();
  associatedTerms = [];
  categoryTermsIdLevels: any
  competencylevels: any;
  levelsInfo = {
    header: {
      content: '',
      level: ''
    },
    data: []
  }
  categoryTermsId: any;
  associatedCompetencies: [];
  reviews = [];
  rating = 0.0;
  oneStarPercentage = 0.0;
  twoStarPercentage = 0.0;
  threeStarPercentage = 0.0;
  fourStarPercentage = 0.0;
  fiveStarPercentage = 0.0;
  slicedItems = 3;
  moreBtnText = 'More';

  constructor(private framework: FrameworkService, private courseConsumptionService: CourseConsumptionService,
    private resourceService: ResourceService) { }

  ngOnChanges() {
    this.levelsInfo.header.content = this.configContent.overview.competencyType;
    this.levelsInfo.header.level = this.configContent.overview.level;
  }
  ngOnInit(): void {
    this.categoryTermsId = this.courseDetails.se_subjectIds || this.courseDetails.targetTaxonomyCategory4Ids;
    this.categoryTermsIdLevels = this.courseDetails.targetTaxonomyCategory5Ids;
    if (this.categoryTermsId) {
      this.framework.getSelectedFrameworkCategories(this.courseDetails.targetFWIds[0]).subscribe((res: any) => {
        if (res.result.framework.categories.length > 3) {
          this.associatedCompetencies = res.result.framework.categories[3].terms.filter((term: any) => this.categoryTermsId.includes(term.identifier))
          this.competencylevels = res.result.framework.categories[4].terms.filter((term: any) => this.categoryTermsIdLevels.includes(term.identifier))
          this.updateLevelInfo();
        }
      })
    }
    // console.log(this.courseDetails['identifier']);
    this.getCourseReviews(this.courseDetails['identifier']);
  }

  updateLevelInfo() {
    this.levelsInfo['data'] = [...this.associatedCompetencies.map((com: any) => {
      return {
        content: com.name,
        level: this.competencylevels[0].index
      }
    })]
  }

  getCourseReviews(courseId: string) {
    let data = {
      "activityId": this.courseDetails['identifier'],
      "activityType": "Course",
      "limit": 100
    };
    this.courseConsumptionService.getCourseReviews(data).subscribe((res: any) => {
      console.log('Reviews', res);
      this.reviews = res["result"]["response"] != null ? res["result"]["response"] : [];
      let oneStar = 0, twoStar = 0, threeStar = 0, fourStar = 0, fiveStar = 0;
      for (let i = 0; i < this.reviews.length; i++) {
        switch (parseInt(this.reviews[i]['rating'])) {
          case 1:
            oneStar += 1;
            break;
          case 2:
            twoStar += 1;
            break;
          case 3:
            threeStar += 1;
            break;
          case 4:
            fourStar += 1;
            break;
          default:
            fiveStar += 1;
        }
        this.rating += parseFloat(this.reviews[i]['rating'])
      }
      if (this.reviews.length > 0) {
        this.rating = this.rating / this.reviews.length;
        this.rating = parseFloat(this.rating.toFixed(1));

        this.oneStarPercentage = (oneStar / this.reviews.length) * 100;
        this.oneStarPercentage = parseFloat(this.twoStarPercentage.toFixed(2));
        this.twoStarPercentage = (twoStar / this.reviews.length) * 100;
        this.twoStarPercentage = parseFloat(this.twoStarPercentage.toFixed(2));
        this.threeStarPercentage = (threeStar / this.reviews.length) * 100;
        this.threeStarPercentage = parseFloat(this.threeStarPercentage.toFixed(2));
        this.fourStarPercentage = (fourStar / this.reviews.length) * 100;
        this.fourStarPercentage = parseFloat(this.fourStarPercentage.toFixed(2));
        this.fiveStarPercentage = (fiveStar / this.reviews.length) * 100;
        this.fiveStarPercentage = parseFloat(this.fiveStarPercentage.toFixed(2));
      }
    });
  }

  getPositiveRating(rating: number) {
    return floor(rating);
  }

  isHalfRating(rating: number) {
    if (rating - floor(rating) > 0) {
      return true;
    } else {
      return false;
    }
  }

  getNegativeRating(rating: number) {
    return floor(5 - rating);
  }

  getProgressbarWidth(width: number) {
    return width + '%';
  }

  updatedSlicing() {
    if (this.slicedItems == 3) {
      this.slicedItems = this.reviews.length;
      this.moreBtnText = 'Less';
    } else {
      this.slicedItems = 3;
      this.moreBtnText = 'More';
    }
  }

  ratingUpdated(event){
    if(event){
      this.rating = 0;
      this.reviews = [];
      this.getCourseReviews(this.courseDetails['identifier']);
      this.ratingUpdation.emit(true);
    }
  }

}
