import { Component, OnInit } from '@angular/core';
import { SearchService } from '@sunbird/core';
import { ResourceService } from '@sunbird/shared';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-all-topics',
  templateUrl: './all-topics.component.html',
  styleUrls: ['./all-topics.component.scss']
})
export class AllTopicsComponent implements OnInit {
  public popularTopics = [];
  public allTopics = [];
  breadCrumbData = [];

  constructor(private searchService: SearchService, public activatedRoute: ActivatedRoute,
    public resourceService: ResourceService, private router: Router) { }

  ngOnInit(): void {
    this.breadCrumbData = [
      {
        "label": this.resourceService.frmelmnts.breadcrumbs.learn,
        "status": "inactive",
        "icon": "school",
        "link": "resources"
      },
      {
        "label": this.resourceService.frmelmnts.breadcrumbs.allTopics,
        "status": "active",
        "icon": "map",
        "link": ""
      }
    ];
    this.fetchData();
  }

  public fetchData() {
    let requestData = {
      "filters": {
        "channel": this.activatedRoute.snapshot.queryParams.channelId,
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
        this.activatedRoute.snapshot.queryParams.facets
      ],
      "sort_by": {
        "lastUpdatedOn": "desc"
      }
    };
    this.searchService.compositePopularSearch(requestData).subscribe(res => {
      this.allTopics = res['result']['facets'][0]['values'];
      this.popularTopics = res['result']['facets'][0]['values'].slice(0, 7);
      console.log('Popular topics', res['result']);
    });
  }

  loadTopicCourses(keyword: string) {
    this.router.navigateByUrl(`search/Courses/1?channel=${this.activatedRoute.snapshot.queryParams.channel}&framework=${this.activatedRoute.snapshot.queryParams.framework}&keyword=${keyword}`)
    console.log('loadKeywordCourses', keyword);
  }

}
