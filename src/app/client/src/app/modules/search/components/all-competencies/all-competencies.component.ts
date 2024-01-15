import { Component, OnInit } from '@angular/core';
import { FrameworkService } from '../../../core/services/framework/framework.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../core/services/search/search.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentSearchService } from '@sunbird/content-search';
import { UserService } from '@sunbird/core';
import { WishlistedService } from '../../../../service/wishlisted.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@sunbird/shared';

interface Competency {
  title?: string,
  type?: string,
  icon?: any,
  description?: string,
  associatedCoursesTxt?: string,
  noOfCourses?: number,
  name?: string,
  btnText?: string,
  expand?: boolean,
  expandData?: any,
  identifier?: string
}

@Component({
  selector: 'app-all-competencies',
  templateUrl: './all-competencies.component.html',
  styleUrls: ['./all-competencies.component.scss']
})
export class AllCompetenciesComponent implements OnInit {
  categoryDetails: any = [];
  allCompetenciesData: Array<Competency> = [];
  allCompetencies: any = {};
  categoryCodes: any = [];
  courses: any = [];
  popularCompetencies: any = [];
  popularCompetenciesData: any = [];
  breadCrumbData = [];
  batchId = "";
  allWishlistedIds = [];

  constructor(private frameworkService: FrameworkService, public activatedRoute: ActivatedRoute, public searchService: SearchService,
    private router: Router, private contentSearchService: ContentSearchService, private userService: UserService, private wishlistedService: WishlistedService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let custodianOrg;
    let defaultBoard;
    this.contentSearchService.initialize(this.activatedRoute.snapshot.queryParams.channel, custodianOrg, defaultBoard)
      .subscribe((res: any) => {
        this.fetchpopularCompetencies();
        this.getWishlisteddoIds();
      })
  }

  public setBreadCrumbData() {
    let param = {};
    param['label'] = 'All competencies';
    param['status'] = "inactive";
    let channelId = this.activatedRoute.snapshot.queryParams.channel;
    let fw = this.activatedRoute.snapshot.queryParams.framework;
    param['link'] = `search/Library/1?channel=${channelId}&framework=${fw}&hideFilter=false`;
    param['showIcon'] = true;
    localStorage.setItem('breadCrumbForAllComp', JSON.stringify(param));
  }

  public findCategory(frameworkId: any) {
    this.frameworkService.getSelectedFrameworkCategories(frameworkId)
      .subscribe((res: any) => {
        this.categoryDetails = [...res.result.framework.categories];
        this.categoryCodes = res.result.framework.categories.map((cat, index) => `target${cat.code.replace(/^./, cat.code[0].toUpperCase())}Ids`);
        this.allCompetencies.title = "All Competencies";
        this.breadCrumbData = [
          {
            "label": "Learn",
            "status": "inactive",
            "icon": "school",
            "link": "resources"
          },
          {
            "label": "All competencies",
            "status": "active",
            "icon": "extension",
            "link": ""
          }
        ];
        const competencyRequestData = {
          "filters": {
            "channel": this.activatedRoute.snapshot.queryParams.channel,
            "primaryCategory": ["Course"],
            "visibility": ["Default", "Parent"]
          },
          "limit": 100,
          "sort_by": {
            "lastPublishedOn": "desc"
          },
          "fields": [],
          "facets": [...this.categoryCodes]
        };
        // competencyRequestData['filters'][catCode]= term.identifier; 
        this.contentSearch(competencyRequestData).subscribe(data => {
          this.courses = data;
          this.courses = this.contentSearchService.updateCourseWithTaggedCompetency(this.courses);
          for (let category of this.categoryDetails) {
            const catCode = `target${category.code.replace(/^./, category.code[0].toUpperCase())}Ids`;
            if (category.name.toLowerCase() == "competencies") {
              for (let term of category.terms) {
                let competency: Competency = {};
                competency.title = term.name;
                competency.description = term.description;
                competency.type = ""; //hardcoded
                competency.noOfCourses = 0;
                competency.icon = "/assets/images/course-icon.png";
                competency.expand = true;
                competency.expandData = [];
                competency.btnText = "View courses";
                competency.associatedCoursesTxt = "Associated courses";
                for (let course of this.courses) {
                  if (course[catCode] && course[catCode].includes(term.identifier)) {
                    competency.expandData.push(course);
                  }
                }
                for (let comp of this.popularCompetencies) {
                  if (comp.name == term.identifier) {
                    competency.noOfCourses = comp.count;
                  }
                }
                this.allCompetenciesData.push(competency);
              }
              this.allCompetencies.data = this.allCompetenciesData;
              this.appendWishlistToCourse();
              console.log(this.allCompetencies);

              this.popularCompetencies.map((comp) => {
                this.categoryDetails.map((category) => {
                  if (category.name.toLowerCase() == "competencies") {
                    for (let term of category.terms) {
                      let competency: Competency = {};
                      if (comp.name == term.identifier) {
                        competency.identifier = term.identifier;
                        competency.title = term.name;
                        competency.type = ""; //hardcoded
                        competency.noOfCourses = comp.count;
                        competency.icon = "/assets/images/course-icon.png";
                        competency.expand = false;
                        competency.associatedCoursesTxt = "Associated courses";
                        this.popularCompetenciesData.push(competency);
                      }
                    }
                  }
                })
              })
              this.popularCompetenciesData.sort((a, b) => b.noOfCourses - a.noOfCourses);
              this.popularCompetencies.data = this.popularCompetenciesData;
            }
          }
        });
      });
  }

  public contentSearch(req: any): Observable<any> {
    return this.searchService.contentSearch(req)
      .pipe(
        map(data => data.result.content)
      );
  }

  public fetchpopularCompetencies() {
    let requestData = {
      "filters": {
        "channel": this.activatedRoute.snapshot.queryParams.channel,
        "status": [
          "Live"
        ],
        "primaryCategory": [
          "Course"
        ]
      },
      "fields": [
        "name"
      ],
      "facets": [
        "targetTaxonomyCategory4Ids"
      ],
      "sort_by": {
        "lastUpdatedOn": "desc"
      }
    };
    this.searchService.compositePopularSearch(requestData).subscribe(res => {
      this.popularCompetencies = res['result']['facets'][0]['values'];
      this.popularCompetencies.title = "Popular competencies";
      this.findCategory(this.activatedRoute.snapshot.queryParams.framework);
    });
  }

  public onCourseClick(event) {
    console.log("identifier", event.identifier);
    this.setBreadCrumbData();
    if (event.hasOwnProperty('batches') && Array.isArray(event.batches) && event.batches.length > 0) {
      event.batches.map(batch => {
        this.batchId = batch.batchId;
      })
      this.router.navigateByUrl(`learn/course/` + event.identifier + `/batch/` + this.batchId);
    } else {
      this.router.navigateByUrl(`learn/course/` + event.identifier);
    }
  }

  loadCompetencyCourses(identifier: any) {
    // console.log('identifier', identifier)
    this.router.navigateByUrl(`search/Courses/1?channel=${this.activatedRoute.snapshot.queryParams.channel}&competency=${identifier}&framework=${this.contentSearchService.frameworkId}`)
    console.log('loadCompetencyCourses', identifier);
  }

  getWishlisteddoIds() {
    let payload = {
      "request": {
        "userId": this.userService._userid
      }
    }

    this.wishlistedService.getWishlistedCourses(payload).subscribe((res: any) => {
      if (res.result.wishlist.length > 0) {
        this.allWishlistedIds = res.result.wishlist;
      }
    });
  }

  appendWishlistToCourse() {
    this.allCompetencies?.data?.forEach((competency: any) => {
        if(competency?.expandData.length > 0) {
          competency.expandData.forEach((course: any) => {
            let isWhishListed;
            if(course.identifier) {
              isWhishListed = this.allWishlistedIds.find((id: string) => id === course.identifier);
            }
            isWhishListed ? course['isWishListed'] = true: course['isWishListed'] = false;
          })
        }
    })
  }

  favoriteIconClicked(data: any) {
    console.log("Icon: ", data);

    let option = data.option;
    let courseId = data.identifier;

    let payload = {
      "request": {
          "userId": this.userService._userid,
          "courseId": courseId
      }
    }
    if(option === 'selected') {
      this.wishlistedService.addToWishlist(payload).subscribe((res: any) => {
          if(res) {
              this.updateWishlistedCourse(option, courseId);
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
                this.updateWishlistedCourse(option, courseId);
                this.wishlistedService.updateData({ message: 'Removed from Wishlist' });
                this.snackBar.openFromComponent(SnackBarComponent, {
                    duration: 2000,
                    panelClass: ['wishlist-snackbar']
                });
            }
        });
    }
  }

  updateWishlistedCourse(option: string, courseId: any) {
    if(option === 'selected') {
      this.courses.forEach((course: any) => {
        if (course?.identifier == courseId || course?.contentId == courseId) {
          course['isWishListed'] = true;
        }
    });
    } else {
      this.courses.forEach((course: any) => {
        if (course?.identifier == courseId || course?.contentId == courseId) {
          course['isWishListed'] = false;
        }
    });
    }
  }

}
