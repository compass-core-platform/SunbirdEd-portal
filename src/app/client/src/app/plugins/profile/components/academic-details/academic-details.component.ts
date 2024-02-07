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
    this.form = this.formBuilder.group({
      // First Column
      tenthSchoolName: [
        this.userProfile?.profileDetails?.academicDetails?.tenthSchoolName ||
          "",
      ],
      tenthSchoolPassing: [
        this.userProfile?.profileDetails?.academicDetails?.tenthSchoolPassing ||
          "",
      ],
      graduationName: [
        this.userProfile?.profileDetails?.academicDetails?.graduationName || "",
      ],
      graduationPassing: [
        this.userProfile?.profileDetails?.academicDetails?.graduationPassing ||
          "",
      ],
      graduationInstituteName: [
        this.userProfile?.profileDetails?.academicDetails
          ?.graduationInstituteName || "",
      ],

      // Second Column
      twelthSchoolNames: [
        this.userProfile?.profileDetails?.academicDetails?.twelthSchoolNames ||
          "",
      ],
      twelthShoolPassingYear: [
        this.userProfile?.profileDetails?.academicDetails
          ?.twelthShoolPassingYear || "",
      ],
      DegreeName: [
        this.userProfile?.profileDetails?.academicDetails?.DegreeName || "",
      ],
      degreeYearOfPassing: [
        this.userProfile?.profileDetails?.academicDetails
          ?.degreeYearOfPassing || "",
      ],
      degreeInstituteName: [
        this.userProfile?.profileDetails?.academicDetails
          ?.degreeInstituteName || "",
      ],
    });
  }
  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;

      this.userService.userData$.subscribe((user: any) => {
        if (user && user.userProfile) {
          this.userProfile = user.userProfile;

          let academicDetails: any = {
            tenthSchoolName: this.payload.tenthSchoolName,
            tenthSchoolPassing: this.payload.tenthSchoolPassing,
            graduationName: this.payload.graduationName,
            graduationPassing: this.payload.graduationPassing,
            graduationInstituteName: this.payload.graduationInstituteName,
            twelthSchoolNames: this.payload.twelthSchoolNames,
            twelthShoolPassingYear: this.payload.twelthShoolPassingYear,
            DegreeName: this.payload.DegreeName,
            degreeYearOfPassing: this.payload.degreeYearOfPassing,
            degreeInstituteName: this.payload.degreeInstituteName,
          };

          this.userProfile.profileDetails = {
            ...this.userProfile.profileDetails,
            academicDetails: {
              ...this.userProfile.profileDetails.academicDetails,
              ...academicDetails,
            },
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
