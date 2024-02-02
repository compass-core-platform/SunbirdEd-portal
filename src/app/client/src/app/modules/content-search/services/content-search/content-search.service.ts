import { Inject, Injectable } from '@angular/core';
import { FrameworkService, ChannelService } from '@sunbird/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { skipWhile, mergeMap, first, map } from 'rxjs/operators';
import { taxonomyConfig, taxonomyEnvironment } from '../../../../framework.config';
import * as _ from 'lodash-es';

const requiredCategories = { categories: '' };
import { TaxonomyService } from '../../../../service/taxonomy.service';

// const requiredCategories = { categories: 'board,gradeLevel,medium,class,subject' };

@Injectable({ providedIn: 'root' })
export class ContentSearchService {
  private channelId: string;
  public _frameworkId = '';
  get frameworkId() {
    return this._frameworkId;
  }
  private defaultBoard: string;
  private custodianOrg: boolean;
  private _filters = {
    board: [],
    medium: [],
    gradeLevel: [],
    subject: [],
    publisher: []
  };
  get filters() {
    return _.cloneDeep(this._filters);
  }
  private _searchResults$ = new BehaviorSubject<any>(undefined);
  taxonomyCategories:any = {};
  get searchResults$(): Observable<any[]> {
    return this._searchResults$.asObservable()
      .pipe(skipWhile(data => data === undefined || data === null));
  }
  channelData:any;
  popularOptions: any;

  constructor(private frameworkService: FrameworkService, private channelService: ChannelService, @Inject(TaxonomyService) private taxonomyService: TaxonomyService) { }

  ngOnInit() {
    this.taxonomyCategories = this.taxonomyService.getTaxonomyCategories();
  }
  
  public initialize(channelId: string, custodianOrg = false, defaultBoard: string) {
    this.channelId = channelId;
    this.custodianOrg = custodianOrg;
    this.defaultBoard = defaultBoard;
    this._searchResults$.complete(); // to flush old subscription
    this._searchResults$ = new BehaviorSubject<any>(undefined);
    return this.fetchChannelData();
  }
  fetchChannelData() {
    return this.channelService.getFrameWork(this.channelId)
      .pipe(mergeMap((channelDetails:any) => {
        
        if (this.custodianOrg) {
          this._filters.board = _.get(channelDetails, 'result.channel.frameworks') || [{
            name: _.get(channelDetails, 'result.channel.defaultFramework'),
            identifier: _.get(channelDetails, 'result.channel.defaultFramework')
          }]; // framework array is empty assigning defaultFramework as only board
          const selectedBoard = this._filters.board.find((board) => board.name === this.defaultBoard) || this._filters.board[0];
          this._frameworkId = _.get(selectedBoard, 'identifier');
        } else {
          this._frameworkId = _.get(channelDetails, 'result.channel.defaultFramework');
        }
        if (_.get(channelDetails, 'result.channel.publisher')) {
          this._filters.publisher = JSON.parse(_.get(channelDetails, 'result.channel.publisher'));
        }
        if (_.get(channelDetails, 'result.channel.popularOptions')) {
          this.popularOptions = JSON.parse(_.get(channelDetails, 'result.channel.popularOptions'));
        }
        this.updateFrameworkInfo(this._frameworkId,this.channelId);
        return this.frameworkService.getSelectedFrameworkCategories(this._frameworkId, requiredCategories);
      }), map(frameworkDetails => {

        const frameworkCategories: any[] = _.get(frameworkDetails, 'result.framework.categories');
        this.channelData = frameworkCategories;
        localStorage.setItem('channelData', JSON.stringify(this.channelData));
        // console.log('frameworkCategories', frameworkCategories);
        frameworkCategories.forEach(category => {
          if ([this.taxonomyCategories[1], this.taxonomyCategories[2], this.taxonomyCategories[3]].includes(category.code)) {
            this._filters[category.code] = category.terms || [];
          } else if (!this.custodianOrg && category.code === this.taxonomyCategories[0]) {
            this._filters[category.code] = category.terms || [];
          }
        });
        return true;
      }), first());
  }
  public fetchFilter(boardName?) {
    if (!this.custodianOrg || !boardName) {
      return of(this.filters);
    }
    const selectedBoard = this._filters.board.find((board) => board.name === boardName)
      || this._filters.board.find((board) => board.name === this.defaultBoard) || this._filters.board[0];
    this._frameworkId = this._frameworkId = _.get(selectedBoard, 'identifier');
    return this.frameworkService.getSelectedFrameworkCategories(this._frameworkId, requiredCategories).pipe(map(frameworkDetails => {
      const frameworkCategories: any[] = _.get(frameworkDetails, 'result.framework.categories');
      frameworkCategories.forEach(category => {
        if ([this.taxonomyCategories[1], this.taxonomyCategories[2], this.taxonomyCategories[3]].includes(category.code)) {
          this._filters[category.code] = category.terms || [];
        } else if (category.code === this.taxonomyCategories[0] && !this.custodianOrg) {
          this._filters[category.code] = category.terms || [];
        }
      });
      return this.filters;
    }), first());
  }

  get getCategoriesMapping() {
    return {
      subject: 'se_subjects',
      medium: 'se_mediums',
      gradeLevel: 'se_gradeLevels',
      board: 'se_boards'
    };
  }

  public mapCategories({ filters = {} }) {
    return _.reduce(filters, (acc, value, key) => {
      const mappedValue = _.get(this.getCategoriesMapping, [key]);
      if (mappedValue && key !== this.taxonomyCategories[3]) { acc[mappedValue] = value; delete acc[key]; }
      return acc;
    }, filters);
  }

  updateFrameworkInfo(framework, identifier){
      // let frameworkInfo = JSON.parse(localStorage.getItem('environment'));
      taxonomyEnvironment.channelId=identifier;
      taxonomyEnvironment.frameworkName= framework;
      localStorage.setItem('environment', JSON.stringify(taxonomyEnvironment));
      localStorage.setItem('taxonomyConfig',JSON.stringify(taxonomyConfig));
  }

  updateCourseWithTaggedCompetency(courses, cardCategory?: string) {
      let updatedCourseList: any = [];
      if(cardCategory == 'enrollment') {
        courses.forEach(course =>{
          let updatedContent = this.mapCourseCompetencyIdwithTerms(course.content)
          course.content = updatedContent;
          updatedCourseList.push(course);
        });
      } else {
        updatedCourseList = courses.map(course =>this.mapCourseCompetencyIdwithTerms(course))
      }
      return updatedCourseList;
  }

  mapCourseCompetencyIdwithTerms(course) {
    if(!this.channelData){
      this.channelData = JSON.parse(localStorage.getItem('channelData'));
    }
    let competencyIdsMapping = [];
    if(course.targetTaxonomyCategory4Ids) {
        course.targetTaxonomyCategory4Ids.forEach(id => {
          competencyIdsMapping.push(this.channelData[3].terms.filter(comp => comp.identifier=== id)[0].name)
        })
    }
    course.competencyIdsMapping = competencyIdsMapping;
    return course
  }
  getCompatencyList(){
    if(!this.channelData){
      this.channelData = JSON.parse(localStorage.getItem('channelData'));
    }
    return this.channelData[3]?.terms.map((term:any) => {return { identifier:term.identifier, name:term.name}});
  }
}
