import { map } from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService } from '@sunbird/shared';
import { LearnerService } from '@sunbird/core';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class BatchParticipantService {
  public updateEvent = new EventEmitter();
  constructor(public configService: ConfigService,
    public learnerService: LearnerService ) { }

  getParticipantList(data) {
    const options = {
      url: this.configService.urlConFig.URLS.BATCH.GET_PARTICIPANT_LIST,
      data: data
    };
    return this.learnerService.post(options).pipe(map((response: any) => {
      return _.get(response, 'result.batch.participants') || [];
    }));
  }

  getAllParticipantList(data) {
    const options = {
      url: this.configService.urlConFig.URLS.BATCH.GET_All_PARTICIPANT_LIST,
      data: data
    };
    return this.learnerService.post(options).pipe(map((response: any) => {
      return _.get(response, 'result.batch') || [];
    }));
  }
}
