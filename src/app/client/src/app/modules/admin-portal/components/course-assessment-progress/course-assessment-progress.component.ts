import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { UserService, OrgDetailsService, SearchService } from '@sunbird/core';
import { ContentSearchService } from '@sunbird/content-search';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import {get} from 'lodash-es';
import { CourseBatchService } from '../../../learn/services/course-batch/course-batch.service';

export interface CourseData {
  id: string;
  name: string;
  appIcon: string;
  competency: string;
  Duration: string;
  publishedDate: string;
  totalMembers: number;
  batchId:any[];
  link: any;
}

@Component({
  selector: 'app-course-assessment-progress',
  templateUrl: './course-assessment-progress.component.html',
  styleUrls: ['./course-assessment-progress.component.scss']
})
export class CourseAssessmentProgressComponent implements OnInit {
  competency = new FormControl('');
  search;
  recentlyPublishedList:any [];
  competenciesList: string[];
  dataSource:CourseData[];
  displayColumns = ['appIcon', 'name', 'competency', 'publishedDate', 'Duration', 'totalMembers', 'link'];
  sortBy:string;
  count: number;
  primaryCategory = 'Course';
  competencyModel:any = {
    selectedCompetenciesList: <Array<any>>[]
  }
  
  constructor( public userService: UserService, private searchService: SearchService, 
    private contentSearchService: ContentSearchService, private orgDetailsService: OrgDetailsService, private courseBatchService: CourseBatchService) { 
      
  }

  ngOnInit(): void {
    this.competenciesList = this.contentSearchService.getCompatencyList();
    this.contentSearchService.fetchChannelData()
    this.fetchRequestContents(0,15);
    
  }

  switchTabs(pr){
    this.primaryCategory = pr;
    this.fetchRequestContents(0,15);
  }

  fetchRequestContents(pageNumber?:number, limit?:number) {
        let searchRequest = { 
              "request": {
                  "fields": [
                      "name", "appIcon", "posterImage", "mimeType", "identifier", "pkgVersion", "resourceType", "contentType", "channel", "organisation", "trackable", "lastPublishedOn", "Duration", "targetTaxonomyCategory4Ids", "primaryCategory", "batches"
                  ],
                  "facets": [
                      "taxonomyCategory4Ids"
                  ],
                  "filters": {
                      "channel": this.getChannelId,
                      "status": [
                          "Live"
                      ],
                      "primaryCategory": [
                        this.primaryCategory
                      ],
                  },
                  "pageNumber":pageNumber,
                  "limit": limit,
                  "sort_by": {
                      "lastPublishedOn": "desc"
                  }
              }
          };
          let option = { ...searchRequest.request };
          if(this.competencyModel.selectedCompetenciesList.length){
            option.filters['targetTaxonomyCategory4Ids'] = this.competencyModel.selectedCompetenciesList.map(comp => comp.identifier);
          }
          const params = { orgdetails: 'orgName,email', framework: this.contentSearchService.frameworkId };
          option['params'] = params;
          if(this.search){option['query'] = this.search;}
          this.searchService.contentSearch(option).subscribe((res: any) => {
              this.recentlyPublishedList = this.sortBy ? res.result.content.concat().sort(this.sort(this.sortBy)) : res.result.content;
              this.recentlyPublishedList = this.contentSearchService.updateCourseWithTaggedCompetency(this.recentlyPublishedList);
              this.count = res.result.count;
             const batchList = this.recentlyPublishedList.map(c => {
                return c.batches?c.batches[0].batchId:'';
              });
              this.getAllparicipentsList(batchList);           
          });  
  }

  getAllparicipentsList(batchList){
    let updateCourseList = [];
      let payload = {
        request:{
          batch: {
            batchId:batchList.filter((b:any) => b!=='' && b !== '01392170577311334432')
          }
        }
      }
      this.courseBatchService.getAllParticipantList(payload).subscribe((res:any) => {
        updateCourseList = this.recentlyPublishedList.map((data:any) => { 
          let courseBatch = data.batches?res.filter((b:any) => b.batchId === data.batches[0].batchId):[];
          return {
            id:data.identifier,
            appIcon:data.appIcon,
            name:data.name,
            competency:data.competencyIdsMapping[0],
            publishedDate: new Date(data.lastPublishedOn).toLocaleDateString(),
            Duration:data.Duration? this.covertTime(data.Duration): 0,
            totalMembers:courseBatch.length>0?courseBatch[0].count:'',
            batchId:data.batches?data.batches[0].batchId:'',
            primaryCategory:data.primaryCategory+'s',
            link:data.batches?{text:'View Progress', path:`batch/${data.identifier}/${data.batches[0].batchId}`}:{text:'View Progress', path:'#'}
          }}); 
          this.dataSource = [...updateCourseList]; 
    });
  }

  getChannelId(): Observable<{ channelId: string, custodianOrg: boolean }> {
    if (this.isUserLoggedIn()) {
        return this.orgDetailsService.getCustodianOrgDetails()
            .pipe(
                map(custodianOrg => {
                    const result = { channelId: this.userService.hashTagId, custodianOrg: false };
                    if (this.userService.hashTagId === get(custodianOrg, 'result.response.value')) {
                        result.custodianOrg = true;
                    }
                    return result;
                }));
    } else {
        if (this.userService.slug) {
            return this.orgDetailsService.getOrgDetails(this.userService.slug)
                .pipe(map(((orgDetails: any) => ({ channelId: orgDetails.hashTagId, custodianOrg: false }))));
        } else {
            return this.orgDetailsService.getCustodianOrgDetails()
                .pipe(map(((orgDetails: any) => ({ channelId: get(orgDetails, 'result.response.value'), custodianOrg: true }))));
        }
    }
  }



  onPageChange(event) {
    this.fetchRequestContents(event.pageIndex+1,event.pageSize);
  }

  public sort = (key:any) => {
      return (a:any, b:any) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
  }

  public isUserLoggedIn(): boolean {
      return this.userService && (this.userService.loggedIn || false);
  }

  onSelect(value:any){
    this.competencyModel.selectedCompetenciesList = value;
    this.fetchRequestContents(0,15);
  }

  searchQuery() {
    this.fetchRequestContents();
  }

  covertTime(time) {
   if(time.length === 1) return time+' Minutes';
   if(time.indexOf('m') === -1 && time.indexOf('M') === -1 && time.indexOf('H') === -1 && time.indexOf('h') === -1) {
      let timeArry = time.split(':');
      let updateTimeArry =  [];
      if(parseInt(timeArry[0]) !== 0) {
        updateTimeArry.push(timeArry[0]+' Hours');
      } 
      if(parseInt(timeArry[1]) !== 0) {
        updateTimeArry.push(timeArry[1]+' Minutes');
      } 
      if(parseInt(timeArry[2]) !== 0) {
        updateTimeArry.push(timeArry[2]+' Seconds');
      } 
      return updateTimeArry.join(' ')
    } else {
      return time;
    } 
  }

  removeCompetencies(selected) {
    this.competencyModel.selectedCompetenciesList = this.competencyModel.selectedCompetenciesList.filter(comp => {
      return selected !== comp.identifier;
    })
    this.fetchRequestContents(0,15);
  }
}