import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { FloatLabelType } from "@angular/material/form-field";
import { UserService, ChannelService } from "@sunbird/core";
import { IUserData, ToasterService, ResourceService } from "@sunbird/shared";
import { ProfileService } from "@sunbird/profile";
import { ContentSearchService } from "@sunbird/content-search";
import _ from "lodash";
import { FrameworkService } from "../../../../modules/core/services/framework/framework.service";
import { ActivatedRoute } from "@angular/router";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
// import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { MatChipInputEvent } from "@angular/material/chips";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-academic-details",
  templateUrl: "./academic-details.component.html",
  styleUrls: ["./academic-details.component.scss"],
})
export class AcademicDetailsComponent implements OnInit {
  form: FormGroup;
  showAdditionalQualification: boolean = false;
  showAdditionalGraduation: boolean = false;
  additionalQualifications: FormGroup[] = [];
  additionalGraduation: FormGroup[] = [];
  formData = {
    colOne: {
      fields: [
        { label: "10th School Name", value: "tenthSchoolName" },
        { label: "10th Year of passing", value: "tenthSchoolPassing" },
        { label: "Graduation Degree", value: "graduationName" },
        { label: "Graduation Year of passing", value: "graduationPassing" },
        {
          label: "Graduation Institute Name",
          value: "graduationInstituteName",
        },
      ],
    },
    colTwo: {
      fields: [
        { label: "12th School Name", value: "twelthSchoolNames" },
        { label: "12th Year of passing", value: "twelthShoolPassingYear" },
        { label: "Post Graduation Degree", value: "DegreeName" },
        {
          label: "Post Graduation Year of passing",
          value: "degreeYearOfPassing",
        },
        {
          label: "Post Graduation Institute Name",
          value: "degreeInstituteName",
        },
      ],
    },
  };
  userProfile: any;
  payload: any = {};
  frameworkId: any;
  positions: any = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  areasOfIntrestCtrl = new FormControl("");
  filteredAreas: Observable<string[]>;
  areas: string[] = [];

  @ViewChild("areaInput") areaInput: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    private profileService: ProfileService,
    public toasterService: ToasterService,
    public resourceService: ResourceService,
    private contentSearchService: ContentSearchService,
    private frameworkService: FrameworkService,
    private channelService: ChannelService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
      }
    });
    if (this.activatedRoute.snapshot.queryParams.showError != undefined) {
      this.toasterService.warning("Please update your designation to proceed.");
    }
    this.channelService
      .getFrameWork(this.activatedRoute.snapshot.queryParams.channel)
      .subscribe((res: any) => {
        this.frameworkId = res.result.channel.frameworks[0].identifier;
        this.frameworkService
          .getSelectedFrameworkCategories(this.frameworkId)
          .subscribe((categories: any) => {
            categories.result.framework.categories.map((item: any) => {
              if (item.identifier == "fracing_fw_taxonomycategory1") {
                this.positions = [...item.terms];
              }
            });
          });
      });
    this.formData.colOne.fields.map((item) => {
      item.label = this.resourceService.frmelmnts.lbl.editProfile[item.value];
    });
    if (this.formData.colTwo && this.formData.colTwo.fields) {
      this.formData.colTwo.fields.map((item) => {
        item.label = this.resourceService.frmelmnts.lbl.editProfile[item.value];
      });
    }
    this.populateForm();
    const additionalQualificationsData = this.userProfile.profileDetails.academicDetails
  .filter(detail => detail.type === "POSTGRADUATE")
  .slice(1);

const additionalGraduationData = this.userProfile.profileDetails.academicDetails
  .filter(detail => detail.type === "GRADUATE")
  .slice(1);
    additionalQualificationsData.forEach((qualification: any) => {
      const additionalQualificationGroup = this.formBuilder.group({
        degree: [qualification.nameOfQualification],
        yearOfPassing: [qualification.yearOfPassing],
        instituteName: [qualification.nameOfInstitute],
      });
      this.additionalQualifications.push(additionalQualificationGroup);
    })
    additionalGraduationData.forEach((qualification: any) => {
      const additionalGraduationGroup = this.formBuilder.group({
        degree: [qualification.nameOfQualification],
        yearOfPassing: [qualification.yearOfPassing],
        instituteName: [qualification.nameOfInstitute],
      });
      this.additionalGraduation.push(additionalGraduationGroup);
    })
  }
  addAdditionalQualification() {
    const additionalQualificationGroup = this.formBuilder.group({
      degree: [""],
      yearOfPassing: [""],
      instituteName: [""],
    });
    this.additionalQualifications.push(additionalQualificationGroup);
    this.showAdditionalQualification = true;
  }
  addAdditionalGraduation() {
    const additionalGraduationGroup = this.formBuilder.group({
      degree: [""],
      yearOfPassing: [""],
      instituteName: [""],
    });
    this.additionalGraduation.push(additionalGraduationGroup);
    this.showAdditionalGraduation = true;
  }
  populateForm() {
    if (this.userProfile?.profileDetails?.academicDetails) {
      const academics = this.userProfile.profileDetails.academicDetails;
      const tenthSchool = academics[0];
      const twelthSchool = academics[1];
      const graduation = academics[2];
      const postGraduation = academics[3];
  
      this.form = this.formBuilder.group({
        tenthSchoolName: [tenthSchool?.nameOfInstitute || ""],
        tenthSchoolPassing: [tenthSchool?.yearOfPassing || ""],
        graduationName: [graduation?.nameOfQualification || ""],
        graduationPassing: [graduation?.yearOfPassing || ""],
        graduationInstituteName: [graduation?.nameOfInstitute || ""],
        twelthSchoolNames: [twelthSchool?.nameOfInstitute || ""],
        twelthShoolPassingYear: [twelthSchool?.yearOfPassing || ""],
        DegreeName: [postGraduation?.nameOfQualification || ""],
        degreeYearOfPassing: [postGraduation?.yearOfPassing || ""],
        degreeInstituteName: [postGraduation?.nameOfInstitute || ""],
      });
    } else {
      this.form = this.formBuilder.group({
        tenthSchoolName: [""],
        tenthSchoolPassing: [""],
        graduationName: [""],
        graduationPassing: [""],
        graduationInstituteName: [""],
        twelthSchoolNames: [""],
        twelthShoolPassingYear: [""],
        DegreeName: [""],
        degreeYearOfPassing: [""],
        degreeInstituteName: [""],
      });
    }
  }
  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;

      this.userService.userData$.subscribe((user: any) => {
        if (user && user.userProfile) {
          this.userProfile = user.userProfile;

          let academicDetails: any = [
            {
              nameOfQualification: "SSLC",
              type: "X_STANDARD",
              nameOfInstitute: this.payload.tenthSchoolName,
              yearOfPassing: this.payload.tenthSchoolPassing,
            },
            {
              nameOfQualification: "PLUS TWO",
              type: "XII_STANDARD",
              nameOfInstitute: this.payload.twelthSchoolNames,
              yearOfPassing: this.payload.twelthShoolPassingYear,
            },
            {
              nameOfQualification: this.payload.graduationName,
              type: "GRADUATE",
              nameOfInstitute: this.payload.graduationInstituteName,
              yearOfPassing: this.payload.graduationPassing,
            },
            {
              nameOfQualification: this.payload.DegreeName,
              type: "POSTGRADUATE",
              nameOfInstitute: this.payload.degreeInstituteName,
              yearOfPassing: this.payload.degreeYearOfPassing,
            },
          ];
          this.additionalQualifications.forEach((qualification) => {
            academicDetails.push({
              nameOfQualification: qualification.value.degree,
              type: "POSTGRADUATE",
              nameOfInstitute: qualification.value.instituteName,
              yearOfPassing: qualification.value.yearOfPassing,
            });
          });
          this.additionalGraduation.forEach((qualification) => {
            academicDetails.push({
              nameOfQualification: qualification.value.degree,
              type: "GRADUATE",
              nameOfInstitute: qualification.value.instituteName,
              yearOfPassing: qualification.value.yearOfPassing,
            });
          });
          this.userProfile.profileDetails = {
            ...this.userProfile.profileDetails,
            academicDetails,
          };

          const payloadWithProfileDetails = {
            profileDetails: this.userProfile.profileDetails,
          };
          this.profileService
            .updatePrivateProfile(payloadWithProfileDetails)
            .subscribe((res) => {
              this.toasterService.success(
                _.get(this.resourceService, "messages.smsg.m0059")
              );
            });
        }
      });
    }
    else {
      const requiredFieldsEmpty = Object.keys(this.form.controls).some(
        (control) => this.form.get(control)?.hasError("required")
      );

      if (requiredFieldsEmpty) {
        this.toasterService.warning("Please fill in all required fields");
      }
    }
  }
}
