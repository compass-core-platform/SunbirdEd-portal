import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {FloatLabelType} from '@angular/material/form-field';
import {UserService, ChannelService} from '@sunbird/core';
import {IUserData, ToasterService, ResourceService} from '@sunbird/shared';
import { ProfileService } from '@sunbird/profile';
import { ContentSearchService } from '@sunbird/content-search';
import _ from 'lodash';
import { FrameworkService } from '../../../../modules/core/services/framework/framework.service';
import { ActivatedRoute } from '@angular/router';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
// import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.scss']
})

export class PersonalDetailsComponent implements OnInit {
  form: FormGroup;
  formData = {"colOne":{"fields":[{"label":"First name","value":"firstName"},{"label":"Last name","value":"lastName"},{"label":"Mobile number","value1":"countryCode","value":"phone"},{"label":"Primary email","value":"primaryEmail"},{"label":"Secondary email","value":"secondaryEmail"},{"label":"Department name","value":"departmentName"},{"label":"Designation","value":"designation"},{"label":"Date of joining","value":"doj"}],"radio":[]},"colTwo":{}}
  userProfile: any;
  payload: any = {};
  frameworkId:any;
  positions: any = [];
  // selectedAreasOfInterest: any = [];
  
  separatorKeysCodes: number[] = [ENTER, COMMA];
  areasOfIntrestCtrl = new FormControl('');
  filteredAreas: Observable<string[]>;
  areas: string[] = [];

  @ViewChild('areaInput') areaInput: ElementRef<HTMLInputElement>;


  constructor(private formBuilder: FormBuilder, public userService: UserService, private profileService: ProfileService, public toasterService: ToasterService, public resourceService: ResourceService, private contentSearchService: ContentSearchService,
    private frameworkService: FrameworkService, private channelService: ChannelService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this.filteredAreas = this.areasOfIntrestCtrl.valueChanges.pipe(
    //   startWith(null),
    //   map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allAreas.slice())),
    // );
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
      }
    });
    if (this.activatedRoute.snapshot.queryParams.showError != undefined) {
      this.toasterService.warning("Please update your designation to proceed.");
    }
    this.channelService.getFrameWork(this.activatedRoute.snapshot.queryParams.channel).subscribe((res: any) =>{
      // console.log("res", res);
      this.frameworkId = res.result.channel.frameworks[0].identifier;
      this.frameworkService.getSelectedFrameworkCategories(this.frameworkId)
      .subscribe((categories: any) => {
        console.log("resssssss", categories.result.framework.categories);
        categories.result.framework.categories.map((item: any)=>{
          if(item.identifier == "fracing_fw_taxonomycategory1"){
            this.positions = [...item.terms];
          }
        })
      })
    })
   

    this.formData.colOne.fields.map((item)=>{
      item.label = this.resourceService.frmelmnts.lbl.editProfile[item.value];
    })
    console.log("user data", this.userProfile);
    this.form = this.formBuilder.group({
      firstName: [{value : this.userProfile?.firstName, disabled: true}],
      lastName: [{value : this.userProfile?.lastName,disabled: true}],
      countryCode : [this.userProfile?.countryCode],
      phone: [this.userProfile?.phone],
      primaryEmail: [{ value: this.userProfile?.email, disabled: true }],
      secondaryEmail: [this.userProfile?.profileDetails?.personalDetails?.secondaryEmail],
      departmentName: [
        this.userProfile?.profileDetails?.employmentDetails?.departmentName || '',
        Validators.required
      ],
      designation: [this.userProfile?.profileDetails?.professionalDetails[0]?.designation || '', Validators.required],
      doj: [this.userProfile?.profileDetails?.professionalDetails[0]?.doj || ''],
    });
    this.areas = this.userProfile?.profileDetails?.areaOfInterest[0].skills || [];
    // console.log('XX', this.selectedAreasOfInterest)
    // console.log('YY', this.userProfile?.profileDetails?.areaOfInterest[0].skills)
  }



  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.areas.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.areasOfIntrestCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.areas.indexOf(fruit);

    if (index >= 0) {
      this.areas.splice(index, 1);
    }
  }

  selected(event: any): void {
    this.areas.push(event.option.viewValue);
    this.areaInput.nativeElement.value = '';
    this.areasOfIntrestCtrl.setValue(null);
  }


  onSubmit(request) {
    // console.log(this.selectedAreasOfInterest);
    if (this.form.valid) {
      console.log('Form submitted!', this.form.value);
      this.payload = this.form.value;
      this.payload.userId = this.userProfile.userId;
      const maskingPattern = /^\*{6}\d{4}$/;
      if(maskingPattern.test(this.payload.phone)){delete this.payload.phone;}
      let profileDetails: any = {};
      let personalDetails: any = {};
      personalDetails.firstName = this.payload.firstName;
      personalDetails.primaryEmail = this.payload.primaryEmail;
      personalDetails.secondaryEmail = this.payload.secondaryEmail;
      delete this.payload.secondaryEmail;
      profileDetails.personalDetails = personalDetails;
      let employmentDetails: any = {};
      employmentDetails.departmentName = this.payload.departmentName;
      delete this.payload.departmentName;
      profileDetails.employmentDetails = employmentDetails;
      let professionalDetails: any = [];
      let professionalDetail: any = {};
      professionalDetail.designation = this.payload.designation;
      professionalDetail.doj = this.payload.doj;
      professionalDetails.push(professionalDetail);
      delete this.payload.designation;
      delete this.payload.doj;
      profileDetails.professionalDetails = professionalDetails;
      let areaOfInterest: any = [];
      areaOfInterest.push({skills: this.areas});
      profileDetails.areaOfInterest = areaOfInterest;
      this.payload.profileDetails = profileDetails;
      this.profileService.updatePrivateProfile(this.payload).subscribe(res => {
        console.log("res",res);
        this.toasterService.success(_.get(this.resourceService, 'messages.smsg.m0059'));
    })
    }
  }

}
