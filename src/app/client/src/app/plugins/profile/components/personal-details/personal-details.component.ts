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
  formData = {"colOne":{"fields":[{"label":"First name","value":"firstName"},{"label":"Last name","value":"lastName"},{"label":"Mobile number","value1":"code","value2":"mobile"},{"label":"Primary email","value":"primaryEmail"},{"label":"Secondary email","value":"secondaryEmail"},{"label":"Department name","value":"departmentName"},{"label":"Designation","value":"designation"},{"label":"Date of joining","value":"doj"}],"radio":[]},"colTwo":{}}
  userProfile: any;
  payload: any = {};

  constructor(private formBuilder: FormBuilder, public userService: UserService, private profileService: ProfileService, public toasterService: ToasterService, public resourceService: ResourceService) { }

  ngOnInit(): void {
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
      }
    });
    console.log("user profile", this.userProfile);
    this.form = this.formBuilder.group({
      firstName: [this.userProfile.firstName, Validators.required],
      lastName: [this.userProfile.lastName, Validators.required],
      mobile: [this.userProfile.phone],
      primaryEmail: [{value: this.userProfile.email, disabled: true}],
      secondaryEmail: [''],
      departmentName: ['', Validators.required],
      designation: ['', Validators.required],
      doj: ['', Validators.required]
    });
  }

  onSubmit(request) {
    if (this.form.valid) {
      console.log('Form submitted!', this.form.value);
      this.payload = this.form.value;
      this.payload.userId = this.userProfile.userId;
      let personalDetails: any = {};
      personalDetails.firstName = this.payload.firstName;
      personalDetails.primaryEmail = this.payload.primaryEmail;
      this.payload.personalDetails = personalDetails;
      let profileDetails: any = {};
      let employmentDetails: any = {};
      employmentDetails.departmentName = this.payload.departmentName;
      delete this.payload.departmentName;
      profileDetails.employmentDetails = employmentDetails;
      this.payload.profileDetails = profileDetails;
      let professionalDetails: any = [];
      let professionalDetail: any = {};
      professionalDetail.designation = this.payload.designation;
      professionalDetail.doj = this.payload.doj;
      professionalDetails.push(professionalDetail);
      delete this.payload.designation;
      delete this.payload.doj;
      this.payload.professionalDetails = professionalDetails;
      this.profileService.updatePrivateProfile(this.payload).subscribe(res => {
        console.log("res",res);
        this.toasterService.success(_.get(this.resourceService, 'messages.smsg.m0059'));
    })
    }
  }

}
