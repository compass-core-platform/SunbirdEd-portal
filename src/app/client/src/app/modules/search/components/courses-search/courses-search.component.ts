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


  constructor(public activatedRoute: ActivatedRoute, public searchService: SearchService,
    public resourceService: ResourceService, private schemaService: SchemaService,
    private contentSearchService: ContentSearchService, public coursesService: CoursesService, public frameworkService: FrameworkService, private snackBar: MatSnackBar,
    private router: Router, public userService: UserService, private toasterService: ToasterService) { }

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
    this.checkUserProfileDetails();
  }

  checkUserProfileDetails() {
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile['profileDetails']['professionalDetails'].length > 0) {
        if (user.userProfile['profileDetails']['professionalDetails'][0]['designation'] == null || ['profileDetails']['professionalDetails'][0]['designation'] == undefined || ['profileDetails']['professionalDetails'][0]['designation'] == '') {
          this.toasterService.warning("Please update your designation to proceed.");
          this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
        }
      } else {
        this.toasterService.warning("Please update your designation to proceed.");
        this.router.navigate(['/profile/edit'], { queryParams: { channel: user.userProfile['rootOrgId'] }, relativeTo: this.activatedRoute });
      }
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
    this.coursesService.enrolledCourseData$.pipe().subscribe(data => {
      this.courses = _.reverse(_.sortBy(data.enrolledCourses, val => {
        return _.isNumber(_.get(val, 'completedOn')) ? _.get(val, 'completedOn') : Date.parse(val.completedOn);
      })) || [];
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
        ]
      },
      fields: [
        "name", "appIcon", "posterImage", "mimeType", "identifier", "pkgVersion", "resourceType", "contentType", "channel", "organisation", "trackable", "lastPublishedOn", "Duration", "targetTaxonomyCategory4Ids", "primarycategory"
      ],
      facets: [
        "taxonomyCategory4Ids"
      ],
      query: key ?? '',
      sort_by: { lastPublishedOn: 'desc' },
      pageNumber: pageNumber
    };
    if (option.filters.keywords == '') {
      delete option.filters.keywords;
    }
    if (option.filters.targetTaxonomyCategory4Ids[0] == '') {
      delete option.filters.targetTaxonomyCategory4Ids;
    }
    this.searchService.contentSearch(option).subscribe(res => {
      this.courses = res['result']['content'];
      this.courses = this.contentSearchService.updateCourseWithTaggedCompetency(this.courses);
      // console.log('Searched Courses', res['result']['content']);
    });
  }

  updateCoursesType(event) {
    // console.log(event.target.value);
    // console.log(event.target.checked);
    if (event.target.checked == true) {
      this.primaryCategories.push(event.target.name);
    } else {
      this.primaryCategories.forEach((element, index) => {
        if (element == event.target.name) this.primaryCategories.splice(index, 1);
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

  favoriteIconClicked(option: string) {
    console.log("Icon: ", option)

    if (option === 'selected') {
      this.snackBar.openFromComponent(SnackBarComponent, {
        duration: 2000,
        panelClass: ['wishlist-snackbar']
      });
    }
  }

}
