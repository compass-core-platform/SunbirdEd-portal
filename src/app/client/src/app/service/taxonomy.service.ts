// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxonomyCategories } from '../framework.config';
import { find } from 'lodash';
import { DataService } from '../modules/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {

  constructor(private http: HttpClient) { }

  getTaxonomyCategories(){
    localStorage.setItem('taxonomyCategories', JSON.stringify(TaxonomyCategories));
    return TaxonomyCategories;
  }

  getCategoryforHTML(obj: any, category: string) {
    if(obj) {
      let c = find(TaxonomyCategories, c => {return category == c});
      return obj[c];      
    }
    return null;
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  getPortalToken() {
    return this.http.get('/portalAuthToken').pipe(map((res:any) => {
       return res.token;
    }));
  }

}