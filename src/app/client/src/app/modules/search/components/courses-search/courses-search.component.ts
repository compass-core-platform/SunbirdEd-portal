import { Component, OnInit } from '@angular/core';
import { SearchService, SchemaService, CoursesService, UserService } from '@sunbird/core';
import { ResourceService, SnackBarComponent, IUserData, ToasterService } from '@sunbird/shared';
import { ContentSearchService } from '@sunbird/content-search';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Subject, of, Observable } from 'rxjs';
import { takeUntil, map, delay, debounceTime, tap, mergeMap } from 'rxjs/operators';
import { FrameworkService } from '../../../core/services/framework/framework.service';
import * as _ from 'lodash-es';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WishlistedService } from '../../../../service/wishlisted.service';


@Component({
  selector: 'app-courses-search',
  templateUrl: './courses-search.component.html',
  styleUrls: ['./courses-search.component.scss']
})
export class CoursesSearchComponent implements OnInit {
  breadCrumbData = [];
  courses = [];
  public unsubscribe$ = new Subject<void>();
  public primaryCategories = ["course", "assessment"];
  selectedCompetency: string;
  rating = [];
  selectedRate = [];
  startRates = [{label:5,selected:false}, 
                {label:4,selected:false},
                {label:3,selected:false},
                {label:2,selected:false},
                {label:1,selected:false},
                ]
  recentlyPublished = true;
  allWishlistedIds = [];
  currentPage=1;
  itemsPerPage=15;
  scrollCheck = false;
  constructor(public activatedRoute: ActivatedRoute, public searchService: SearchService,
    public resourceService: ResourceService, private schemaService: SchemaService,
    private contentSearchService: ContentSearchService, public coursesService: CoursesService, public frameworkService: FrameworkService, private snackBar: MatSnackBar,
    private router: Router, private userService: UserService, private wishlistedService: WishlistedService, private toasterService: ToasterService) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams.learnings == 'true') {
      this.breadCrumbData = [
        {
          "label": "Profile",
          "icon": "person",
          "status": "inactive",
          "link": "profile"
        },
        {
          "label": "Learnings",
          "status": "active",
          "icon": "play_circle_filled",
          "link": ""
        }
      ];
      this.getTrainingAttended();
    } else {
      this.breadCrumbData = [
        {
          "label": "Learn",
          "icon": "school",
          "status": "inactive",
          "link": "resources"
        },
        {
          "label": "Search",
          "status": "active",
          "icon": "search",
          "link": ""
        }
      ];
      this.fetchContentOnParamChange();
    }
    this.frameworkService.getSelectedFrameworkCategories(this.activatedRoute.snapshot.queryParams.framework)
      .subscribe((res: any) => {
        res.result.framework.categories.map((item) => {
          if (item.name == "Competencies") {
            item.terms.map((term) => {
              if (term.identifier == this.activatedRoute.snapshot.queryParams.competency) {
                this.selectedCompetency = term.name;
              }
            })
          }
        })
      })
    // this.checkUserProfileDetails();
  }

  // checkUserProfileDetails() {
  //   this.userService.userData$.subscribe((user: IUserData) => {
  //     if (user.userProfile['profileDetails']['professionalDetails'].length > 0) {
  //       if (user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == null || user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == undefined || user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == '') {
  //         this.toasterService.warning("Please update your designation to proceed.");
  //         this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
  //       }
  //     } else {
  //       this.toasterService.warning("Please update your designation to proceed.");
  //       this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
  //     }
  //   });
  // }

  private getWishlisteddoids() {
    let payload = {
      "request": {
        "userId": this.userService._userid
      }
    }

    this.wishlistedService.getWishlistedCourses(payload).subscribe((res: any) => {
      if (res.result.wishlist.length > 0) {
        this.allWishlistedIds = res.result.wishlist;
      }
      this.appendWishlistToCourse();
    });

  }

  private fetchContentOnParamChange() {
    combineLatest(this.activatedRoute.params, this.activatedRoute.queryParams, this.schemaService.fetchSchemas())
      .pipe(debounceTime(5),
        map((result) => ({ params: { pageNumber: Number(result[0].pageNumber) }, queryParams: result[1] })),
        takeUntil(this.unsubscribe$))
      .subscribe(({ params, queryParams }) => {
        // console.log(params, queryParams);
        this.fetchContents(params.pageNumber, queryParams.channel, queryParams.key, queryParams.competency, queryParams.keyword);
      });
  }

  private getTrainingAttended() {
    let payload = {
      "request": {
        "userId": this.userService._userid
      }
    }

    this.wishlistedService.getWishlistedCourses(payload).subscribe((res: any) => {
      if (res.result.wishlist.length > 0) {
        this.allWishlistedIds = res.result.wishlist;
      }
      this.coursesService.enrolledCourseData$.pipe().subscribe(data => {
        this.coursesService.enrolledCourseData$.pipe().subscribe(data => {
          this.courses = _.reverse(_.sortBy(data.enrolledCourses, val => {
            return _.isNumber(_.get(val, 'completedOn')) ? _.get(val, 'completedOn') : Date.parse(val.completedOn);
          })) || [];
          this.appendWishlistToCourse();
        });
      });
    });
  }

  public fetchContents(pageNumber, channelId, key, competency, keyword) {
    const option = {
      filters: {
        primaryCategory: this.primaryCategories,
        visibility: ["Default", "Parent"],
        channel: channelId,
        keywords: keyword ?? '',
        targetTaxonomyCategory4Ids: [
          competency ?? ''
        ],
       avgRating: this.selectedRate
      },
      fields: [
        "name", "appIcon", "posterImage", "mimeType", "identifier", "pkgVersion", "resourceType", "contentType", "channel", "organisation", "trackable", "lastPublishedOn", "Duration", "targetTaxonomyCategory4Ids", "primaryCategory", "avgRating"
      ],
      facets: [
        "taxonomyCategory4Ids"
      ],
      query: key ?? '',
      sort_by: { lastPublishedOn: this.recentlyPublished?'desc':'asc' },
      pageNumber: this.currentPage,
      limit:this.itemsPerPage
    };
    if (option.filters.keywords == '') {
      delete option.filters.keywords;
    }
    if (option.filters.targetTaxonomyCategory4Ids[0] == '') {
      delete option.filters.targetTaxonomyCategory4Ids;
    }
    this.searchService.contentSearch(option).subscribe(res => {
      this.getWishlisteddoids();
      this.courses = [...this.courses, ...res['result']['content']];
      this.courses =  this.contentSearchService.updateCourseWithTaggedCompetency(this.courses);
      this.scrollCheck = false;
      // console.log('Searched Courses', res['result']['content']);
    });
  }

  appendWishlistToCourse() {
    this.courses.forEach((course: any) => {
      let isWhishListed;
      if(course.identifier) {
        isWhishListed = this.allWishlistedIds.find((id: string) => id === course.identifier);
      } else {
        isWhishListed = this.allWishlistedIds.find((id: string) => id === course.contentId);
      }
      isWhishListed ? course['isWishListed'] = true: course['isWishListed'] = false;
    })
  }

  updateCoursesType(event) {
    // console.log(event.target.value);
    // console.log(event.target.checked);
    if (event.checked) {
      this.primaryCategories.push(event.source.name);
    } else {
      this.primaryCategories.forEach((element, index) => {
        if (element == event.source.name) this.primaryCategories.splice(index, 1);
      });
    }
    if (this.primaryCategories.length == 0) {
      this.courses = [];
    } else {
      this.fetchContentOnParamChange();
    }
  }

  courseCardClicked(course: any) {
    this.router.navigate(['/learn/course', course['contentId'] ?? course['identifier']]);
  }

  favoriteIconClicked(option: string, courseId: any) {
    console.log("Icon: ", option);

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

  getRatingText(index) {
    this.rating = [];
    for(let i = index; i>0; i--){
       this.rating.push(i); 
    }
      return this.rating;
  }

  recentlyAddCourses() {
    this.courses = [];
    this.currentPage = 1
    this.fetchContentOnParamChange();
  }

  updateAllSelected(){
    this.courses = [];
    this.currentPage = 1
    this.selectedRate = this.startRates.filter(s => s.selected).map(r => r.label);
    this.fetchContentOnParamChange();
  }
  onScroll(){
    this.currentPage++;
    this.scrollCheck = true;
    this.fetchContentOnParamChange();
  }
  scrolledUp(){
    this.currentPage--;
    this.scrollCheck = true;
    this.fetchContentOnParamChange();
  }
}
