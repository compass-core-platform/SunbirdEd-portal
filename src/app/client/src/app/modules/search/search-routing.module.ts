import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
  UserSearchComponent, UserEditComponent, UserProfileComponent, HomeSearchComponent,
  UserDeleteComponent, AllCompetenciesComponent
} from './components';
import { AuthGuard } from '../core/guard/auth-gard.service';
import { AllTopicsComponent } from './components/all-topics/all-topics.component';
import { CoursesSearchComponent } from './components/courses-search/courses-search.component';
import { WhishlistCoursesComponent } from './components/whishlist-courses/whishlist-courses.component';

const routes: Routes = [
  {
    path: 'All/:pageNumber', component: HomeSearchComponent,
    data: {
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Search', url: '' }],
      telemetry: {
        env: 'home', pageid: 'home-search', type: 'view', subtype: 'paginate'
      }
    }

  },
  // {
  //   path: 'Courses/:pageNumber', component: HomeSearchComponent,
  //   data: {
  //     breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Search', url: '' }],
  //     telemetry: {
  //       env: 'course', pageid: 'course-search', type: 'view', subtype: 'paginate'
  //     }
  //   }

  // },
  {
    path: 'Courses/:pageNumber', component: CoursesSearchComponent,
    data: {
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Search', url: '' }],
      telemetry: {
        env: 'course', pageid: 'course-search', type: 'view', subtype: 'paginate'
      }
    }

  },
  {
    path: 'Topics/:pageNumber', component: AllTopicsComponent,
    data: {
      breadcrumbs: [],
      telemetry: {
        
      }
    }

  },
  {
    path: 'Library/:pageNumber', component: AllCompetenciesComponent,
    data: {
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Search', url: '' }],
      telemetry: {
        env: 'library', pageid: 'library-search', type: 'view', subtype: 'paginate'
      },
      softConstraints: {badgeAssertions: 98, channel: 100}
    }

  },
  {
    path: 'Users/:pageNumber', component: UserSearchComponent, canActivate: [AuthGuard],
    data: {
      roles: 'rootOrgAdmin',
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Profile', url: '/profile' }, { label: 'Search', url: '' }],
      telemetry: {
        env: 'profile', pageid: 'user-search', type: 'view', subtype: 'paginate'
      }
    },
    children: [
      {
        path: 'edit/:userId', component: UserEditComponent, data: {
          telemetry: {
            env: 'profile', pageid: 'user-edit', type: 'edit', subtype: 'paginate'
          }
        }
      },
      { path: 'delete/:userId', component: UserDeleteComponent }
    ]
  },
  {
    path: 'Users/:pageNumber/view/:userId', component: UserProfileComponent,
    data: {
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Profile', url: '/profile' }],
      telemetry: {
        env: 'profile', pageid: 'user-detail', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'wishlist', component: WhishlistCoursesComponent,
    data: {
      telemetry: {
        env: 'profile', pageid: 'user-detail', type: 'view', subtype: 'paginate'
      }
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
