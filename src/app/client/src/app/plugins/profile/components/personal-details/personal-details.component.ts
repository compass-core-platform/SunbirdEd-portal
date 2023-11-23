import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UserService} from '@sunbird/core';
import {IUserData, ToasterService, ResourceService} from '@sunbird/shared';
import { ProfileService } from '@sunbird/profile';
import _ from 'lodash';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.scss']
})
export class PersonalDetailsComponent implements OnInit {
  form: FormGroup;
  formData = {"colOne":{"fields":[{"label":"First name","value":"firstName"},{"label":"Last name","value":"lastName"},{"label":"Mobile number","value1":"code","value":"phone"},{"label":"Primary email","value":"primaryEmail"},{"label":"Secondary email","value":"secondaryEmail"},{"label":"Department name","value":"departmentName"},{"label":"Designation","value":"designation"},{"label":"Date of joining","value":"doj"}],"radio":[]},"colTwo":{}}
  userProfile: any;
  payload: any = {};

  constructor(private formBuilder: FormBuilder, public userService: UserService, private profileService: ProfileService, public toasterService: ToasterService, public resourceService: ResourceService) { }

  ngOnInit(): void {
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
      }
    });
    this.formData.colOne.fields.map((item)=>{
      item.label = this.resourceService.frmelmnts.lbl.editProfile[item.value];
    })
    console.log("user data", this.userProfile);
    this.form = this.formBuilder.group({
      firstName: [{value : this.userProfile?.firstName, disabled: true}],
      lastName: [{value : this.userProfile?.lastName,disabled: true}],
      phone: [this.userProfile?.phone],
      primaryEmail: [{ value: this.userProfile?.email, disabled: true }],
      secondaryEmail: [this.userProfile?.secondaryEmail],
      departmentName: [
        this.userProfile?.profileDetails?.employmentDetails?.departmentName || '',
        Validators.required
      ],
      designation: [this.userProfile?.profileDetails?.professionalDetails[0]?.designation || '', Validators.required],
      doj: [this.userProfile?.profileDetails?.professionalDetails[0]?.doj || '', Validators.required]
    });
  }

  onSubmit(request) {
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
      this.payload.profileDetails = profileDetails;
      this.profileService.updatePrivateProfile(this.payload).subscribe(res => {
        console.log("res",res);
        this.toasterService.success(_.get(this.resourceService, 'messages.smsg.m0059'));
    })
    }
  }

}
