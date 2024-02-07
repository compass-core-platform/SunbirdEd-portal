import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@sunbird/shared';
import { UserService, SearchService } from '@sunbird/core';
import { ResourceService } from '@sunbird/shared';
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  configContent: any = {}
  // CAROUSEL_BREAKPOINT = 768;
  CAROUSEL_BREAKPOINT = 1400;
  carouselDisplayMode = 'multiple';
  courses: any = {};

  layoutConfiguration;
  showIcon: boolean = false;

  constructor(public layoutService: LayoutService, public searchService: SearchService,
    private router: Router, public resourceService: ResourceService,
    public userService: UserService) { }

  ngOnInit() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    let searchRequest = {
      "request": {
        "filters": {
          "primaryCategory": ["Course", "Course Assessment"],
          "visibility": ["Default", "Parent"],
          "channel": "0139075341124321280"
        },
        "limit": 12,
        "sort_by": {
          "lastPublishedOn": "desc"
        },
        "fields": ["name", "appIcon", "posterImage", "mimeType", "identifier", "pkgVersion", "resourceType", "primaryCategory", "contentType", "channel", "organisation", "trackable", "Duration", "targetTaxonomyCategory4Ids", "primaryCategory", "avgRating"],
        "offset": 0
      }
    };

    const option = { ...searchRequest['request'] };
    const params = { orgdetails: 'orgName,email' };
    option['params'] = params;
    this.searchService.contentSearch(option).subscribe((res: any) => {
      this.courses = res["result"]["content"];
      // console.log('Courses', this.courses);
    });
  }
  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [{
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 520,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }]
  };

  slickInit(e: any) {
    // console.log('slick initialized');
  }

  breakpoint(e: any) {
    // console.log('breakpoint');
  }

  afterChange(e: any) {
    // console.log('afterChange');
  }

  beforeChange(e: any) {
    // console.log('beforeChange');
  }

  loginClick = () => {
    window.location.href = '/resources';
  }

  registerClick = () => {
    this.router.navigateByUrl('/signup')
  }

  doJsonDecode = (data: any) => {
    return JSON.parse(data);
  }

}