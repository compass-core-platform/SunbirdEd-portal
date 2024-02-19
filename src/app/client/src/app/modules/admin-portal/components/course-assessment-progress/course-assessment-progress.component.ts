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
      let res = [
        {
            "count": 3,
            "batchId": "0139924414976901120",
            "participants": [
                "271cd17a-825a-4f42-8ba3-d94f574c76a1",
                "809aa1a9-8759-43a6-b7fd-b31e13afe513",
                "87fd80a9-63e9-4e90-81bb-4b6956c2561b"
            ]
        },
        {
            "count": 0,
            "batchId": "0139917361192550401",
            "participants": []
        },
        {
            "count": 2,
            "batchId": "0139917230904197120",
            "participants": [
                "6eee585a-3b6b-482c-92bb-a34a23a0e161",
                "9f4611d4-ab92-4acd-b3ce-13594e362eca"
            ]
        },
        {
            "count": 3,
            "batchId": "0139854932667596800",
            "participants": [
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "809aa1a9-8759-43a6-b7fd-b31e13afe513",
                "fe6e381c-7488-452c-8aab-40053361f23c"
            ]
        },
        {
            "count": 6,
            "batchId": "0139826817773158402",
            "participants": [
                "ed458746-dca8-4649-afc9-acddee0e6473",
                "5895d832-231f-4268-989a-9b2704592c36",
                "fa10f4ec-a4e1-4efd-aad8-e24c48767774",
                "4ff8e27c-c294-4fa4-85b3-52cefaff2f73",
                "c225b5e8-0b92-45e1-a5dc-86cce05c355a",
                "b555ca3f-2e11-4dc7-920d-b34fe65d69ef"
            ]
        },
        {
            "count": 1,
            "batchId": "0139825449135226880",
            "participants": [
                "fa10f4ec-a4e1-4efd-aad8-e24c48767774"
            ]
        },
        {
            "count": 6,
            "batchId": "0139753805552271361",
            "participants": [
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "611e6da4-f1b1-4d60-9680-f677b7ec13f8",
                "b3819bc8-17c4-456d-a5a2-92a7919857f7",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "c225b5e8-0b92-45e1-a5dc-86cce05c355a",
                "e3231918-ca1d-418e-b330-af57cbc812f7"
            ]
        },
        {
            "count": 9,
            "batchId": "0139747491095674880",
            "participants": [
                "fa10f4ec-a4e1-4efd-aad8-e24c48767774",
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "b3819bc8-17c4-456d-a5a2-92a7919857f7",
                "a567eba2-3917-468b-ad7c-58db022c5ae2",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "c225b5e8-0b92-45e1-a5dc-86cce05c355a",
                "18018d47-ac5f-4763-b816-704accaae56d",
                "559a71b2-77ba-4b1f-add3-94a26959febc",
                "c9bfd2ec-4e86-408c-a320-51ccb767b0b0"
            ]
        },
        {
            "count": 8,
            "batchId": "01397048026546995237",
            "participants": [
                "79380f99-7a6f-45ad-b06a-385f5f7a346f",
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "611e6da4-f1b1-4d60-9680-f677b7ec13f8",
                "b3819bc8-17c4-456d-a5a2-92a7919857f7",
                "cc87012e-ee59-451d-9ccd-50c0ca5a8cba",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "1e82b03b-01ae-449f-a14d-ff232c959a48",
                "11fa2cd8-d8a3-4e67-b0ff-506a92f5b231"
            ]
        },
        {
            "count": 7,
            "batchId": "0139620031873843201",
            "participants": [
                "c650885f-0171-4987-9b1b-9b7ea6bd0533",
                "79380f99-7a6f-45ad-b06a-385f5f7a346f",
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "b3819bc8-17c4-456d-a5a2-92a7919857f7",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "1e82b03b-01ae-449f-a14d-ff232c959a48",
                "95873c2c-9fe2-4b08-88e3-c52018c9e3d4"
            ]
        },
        {
            "count": 6,
            "batchId": "01395641668594892850",
            "participants": [
                "79380f99-7a6f-45ad-b06a-385f5f7a346f",
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "b3819bc8-17c4-456d-a5a2-92a7919857f7",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "d2a2f934-92d8-4eb6-a61f-c35a85c9d9e7",
                "559a71b2-77ba-4b1f-add3-94a26959febc"
            ]
        },
        {
            "count": 5,
            "batchId": "01395583863064985633",
            "participants": [
                "79380f99-7a6f-45ad-b06a-385f5f7a346f",
                "fa10f4ec-a4e1-4efd-aad8-e24c48767774",
                "1fc08c1b-39bb-4b53-a25d-12bf9ef99e4f",
                "a567eba2-3917-468b-ad7c-58db022c5ae2",
                "fe6e381c-7488-452c-8aab-40053361f23c"
            ]
        },
        {
            "count": 7,
            "batchId": "0139552376283299845",
            "participants": [
                "ede5e17a-7a69-4aea-9cd2-99b12d532f5a",
                "79380f99-7a6f-45ad-b06a-385f5f7a346f",
                "fa10f4ec-a4e1-4efd-aad8-e24c48767774",
                "8082ba9f-4d00-4f20-bad2-0fd90ad627da",
                "c225b5e8-0b92-45e1-a5dc-86cce05c355a",
                "fe6e381c-7488-452c-8aab-40053361f23c",
                "559a71b2-77ba-4b1f-add3-94a26959febc"
            ]
        }
    ]
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
   console.log("table", this.dataSource);
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