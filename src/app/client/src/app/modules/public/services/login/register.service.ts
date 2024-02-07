import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LearnerService, PublicDataService } from '@sunbird/core';
import { ConfigService } from '@sunbird/shared';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http: HttpClient, public learnerService: LearnerService, public publicDataService: PublicDataService, private config: ConfigService) { }

  register(data: any) {
    // const httpHeaders: HttpHeaders = new HttpHeaders({
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0WEFsdFpGMFFhc1JDYlFnVXB4b2RvU2tLRUZyWmdpdCJ9.mXD7cSvv3Le6o_32lJplDck2D0IIMHnv0uJKq98YVwk',
    //   'Content-Type': 'application/json',
    // });
     const option = {
      url: this.config.urlConFig.URLS.USER.SIGNUP,
      data: data
    };
    return this.learnerService.post(option);
  }

}
