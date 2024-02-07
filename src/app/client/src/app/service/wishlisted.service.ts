import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LearnerService } from  '../modules/core/services/learner/learner.service';
import { ConfigService } from '@sunbird/shared' 

interface SnackBarData {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistedService {
  private dataSubject = new BehaviorSubject<SnackBarData>({ message: '' });
  public data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private learnerService: LearnerService, private configService: ConfigService) { }

  updateData(data: SnackBarData) {
    this.dataSubject.next(data);
  }

  addToWishlist(payload: any) {
    const option = {
      url: this.configService.urlConFig.URLS.WISHLIST.ADD,
      data: payload
    };
    return this.learnerService.post(option);
  }

  removeFromWishlist(payload: any) {
    const option = {
      url: this.configService.urlConFig.URLS.WISHLIST.REMOVE,
      data: payload
    };
    return this.learnerService.post(option);
  }

  getWishlistedCourses(payload: any) {
    const option = {
      url: this.configService.urlConFig.URLS.WISHLIST.GET_LIST,
      data: payload
    };
    return this.learnerService.post(option);
  }

}