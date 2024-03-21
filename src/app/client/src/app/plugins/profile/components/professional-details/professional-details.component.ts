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
  selector: "app-professional-details",
  templateUrl: "./professional-details.component.html",
  styleUrls: ["./professional-details.component.scss"],
})
export class ProfessionalDetailsComponent implements OnInit {
  form: FormGroup;
  formData: any = {
    colOne: {
      fields: [
        { label: "Type of Organisation", value: "organisationType" },
        { label: "Organisation Name", value: "name" },
        { label: "Industry", value: "industry" },
        { label: "Location", value: "location" },
        { label: "Description", value: "description" },
        { label: "Pay Type", value: "payType" },
        { label: "Service", value: "service" },
      ],
    },
    colThree: {
      fields: [
        { label: "Cadre", value: "cadre" },
        { label: "Allotment Year of Service", value: "allotmentYear" },
        { label: "Civil List Number", value: "civilListNumber" },
        { label: "Employee Code", value: "employeeCode" },
        { label: "Date of joining of service", value: "dojOfService" },
        { label: "Official Postal Address", value: "officialPostalAddress" },
        { label: "Pin Code", value: "pinCode" },
      ],
    },
  };
  userProfile: any;
  payload: any = {};
  frameworkId: any;
  positions: any = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

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

    if (this.formData.colThree && this.formData.colThree.fields) {
      this.formData.colThree.fields.map((item) => {
        item.label = this.resourceService.frmelmnts.lbl.editProfile[item.value];
      });
    }
    this.populateForm()
  }
  populateForm() {
    if (this.userProfile?.profileDetails?.professionalDetails) {
      const professionalDetails = this.userProfile.profileDetails.professionalDetails[0]; // Assuming there is only one set of professional details
      const employmentDetails = this.userProfile.profileDetails.employmentDetails;
  
      this.form = this.formBuilder.group({
        organisationType: [professionalDetails?.organisationType || ""],
        name: [professionalDetails?.name || ""],
        industry: [professionalDetails?.industry || ""],
        location: [professionalDetails?.location || ""],
        description: [professionalDetails?.description || ""],
        payType: [employmentDetails?.payType || ""],
        service: [employmentDetails?.service || ""],
        cadre: [employmentDetails?.cadre || ""],
        allotmentYear: [employmentDetails?.allotmentYearOfService || ""],
        civilListNumber: [employmentDetails?.civilListNo || ""],
        employeeCode: [employmentDetails?.employeeCode || ""],
        dojOfService: [employmentDetails?.dojOfService || ""],
        officialPostalAddress: [employmentDetails?.officialPostalAddress || ""],
        pinCode: [employmentDetails?.pinCode || ""],
      });
    } else {
      this.form = this.formBuilder.group({
        organisationType: [""],
        name: [""],
        industry: [""],
        location: [""],
        description: [""],
        payType: [""],
        service: [""],
        cadre: [""],
        allotmentYear: [""],
        civilListNumber: [""],
        employeeCode: [""],
        dojOfService: [""],
        officialPostalAddress: [""],
        pinCode: [""],
      });
    }
  }
  
  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;

      this.userService.userData$.subscribe((user: any) => {
        if (user && user.userProfile) {
          this.userProfile = user.userProfile;

          let professionalDetails: any = [
            {
              designation:
                this.userProfile?.profileDetails?.professionalDetails[0]
                  ?.designation,
              doj: this.userProfile?.profileDetails?.professionalDetails[0]
                ?.doj,
                organisationType: this.payload.organisationType,
              name: this.payload.name,
              industry: this.payload.industry,
              location: this.payload.location,
              description: this.payload.description,
            },
          ];
          let employmentDetails: any = {
            departmentName:
              this.userProfile?.profileDetails?.employmentDetails
                ?.departmentName,
            cadre: this.payload.cadre,
            allotmentYearOfService: this.payload.allotmentYear,
            civilListNo: this.payload.civilListNumber,
            employeeCode: this.payload.employeeCode,
            payType: this.payload.payType,
            service: this.payload.service,
            dojOfService: this.payload.dojOfService,
            officialPostalAddress: this.payload.officialPostalAddress,
            pinCode: this.payload.pinCode,
          };
          this.userProfile.profileDetails = {
            ...this.userProfile.profileDetails,
            employmentDetails: employmentDetails,
            professionalDetails: professionalDetails,
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
    } else {
      const requiredFieldsEmpty = Object.keys(this.form.controls).some(
        (control) => this.form.get(control)?.hasError("required")
      );

      if (requiredFieldsEmpty) {
        this.toasterService.warning("Please fill in all required fields");
      }
    }
  }
}
