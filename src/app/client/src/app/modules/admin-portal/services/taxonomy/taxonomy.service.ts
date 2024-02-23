import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {

  constructor(private http: HttpClient) { }

  
  getPortalToken() {
    return this.http.get('/portalAuthToken').pipe(map((res:any) => {
       return res.token;
    }));
  }

}