import { Component, OnInit } from '@angular/core';
import { UserService, SearchService } from '@sunbird/core';
import { WishlistedService } from '../../../../service/wishlisted.service';
import { ContentSearchService } from '@sunbird/content-search';
import { Router } from '@angular/router';
import { SnackBarComponent, ResourceService } from "@sunbird/shared";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-whishlist-courses',
  templateUrl: './whishlist-courses.component.html',
  styleUrls: ['./whishlist-courses.component.scss']
})
export class WhishlistCoursesComponent implements OnInit {
  breadCrumbData = [];
  wishListedCourses = [];
  allWishlistedIds = [];
  channelId: any;

  constructor(private userService: UserService, private wishlistedService: WishlistedService,
    private searchService: SearchService, private contentSearchService: ContentSearchService, public router: Router,
    private snackBar: MatSnackBar, public resourceService: ResourceService) { }

  ngOnInit(): void {
    if (this.userService.loggedIn) {
      this.userService.userData$.subscribe((user: any) => {
        if (user && !user.err) {
          this.channelId = this.userService.channel;
          this.breadCrumbData = [
            {
              "label": "Learn",
              "status": "inactive",
              "icon": "school",
              "link": "resources"
            },
            {
              "label": "Wishlist",
              "status": "active",
              "icon": "favorite",
              "link": ""
            }
          ];
          this.getWishlistedCourses()
        }
      });
    }
  }

  getWishlistedCourses() {
    let payload = {
      "request": {
        "userId": this.userService._userid
      }
    }

    this.wishlistedService.getWishlistedCourses(payload).subscribe((res: any) => {
      if (res.result.wishlist.length > 0) {
        this.allWishlistedIds = res.result.wishlist;
        this.getWishlistedCoursesData(this.allWishlistedIds);
      }
    });

  }

  getWishlistedCoursesData(ids: any[]) {
    let payload = {
      "request": {
        "filters": {
          "identifier": ids,
          "channel": this.channelId,
          "status": [
            "Live"
          ]
        },
        "sort_by": {
          "lastUpdatedOn": "desc"
        }
      }
    };

    const option = { ...payload.request };
    const params = {}
    option['params'] = params
    this.searchService.contentSearch(option).subscribe((res: any) => {
      this.wishListedCourses = this.contentSearchService.updateCourseWithTaggedCompetency(res.result.content);
      if (this.wishListedCourses.length > 0) {
        this.wishListedCourses = this.wishListedCourses.map((res: any) => {
          res['isWishListed'] = true;
          return res;
        });
        console.log("All wishlisted Courses", this.wishListedCourses);
      }
    });
  }

  redirectToToc(content: any) {
    this.router.navigate(['/learn/course', content['identifier']])
  }

  favoriteIconClicked(option: string, courseId: any) {
    console.log("Icon: ", option);

    let payload = {
      "request": {
        "userId": this.userService._userid,
        "courseId": courseId
      }
    }

    if (option === 'selected') {
      this.wishlistedService.addToWishlist(payload).subscribe((res: any) => {
        if (res) {
          this.wishListedCourses.forEach((res: any) => {
            if (res.identifier == courseId) {
              res['isWishListed'] = true;
            }
          });
          this.wishlistedService.updateData({ message: 'Added to Wishlist' });
          this.snackBar.openFromComponent(SnackBarComponent, {
            duration: 2000,
            panelClass: ['wishlist-snackbar']
          });
        }
      });
    } else {
      this.wishlistedService.removeFromWishlist(payload).subscribe((res: any) => {
        if (res) {
          this.wishListedCourses = this.wishListedCourses.filter((course: any) => course.identifier !== courseId);
          this.wishlistedService.updateData({ message: 'Removed from Wishlist' });
          this.snackBar.openFromComponent(SnackBarComponent, {
            duration: 2000,
            panelClass: ['wishlist-snackbar']
          });
        }
      });
    }
  }

}
