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
  selector: "app-personal-details",
  templateUrl: "./personal-details.component.html",
  styleUrls: ["./personal-details.component.scss"],
})
export class PersonalDetailsComponent implements OnInit {
  form: FormGroup;
  formData = {
    colOne: {
      fields: [
        { label: "First name", value: "firstName" },
        { label: "Last name", value: "lastName" },
        { label: "Mobile number", value1: "countryCode", value: "phone" },
        { label: "Primary email", value: "primaryEmail" },
        { label: "Secondary email", value: "secondaryEmail" },
        { label: "Department name", value: "departmentName" },
        { label: "Designation", value: "designation" },
      ],
      radio: [],
    },
    colTwo: {
      fields: [
        { label: "Domicile", value: "domicileMedium" },
        { label: "Telephone Number", value: "telephone" },
        { label: "Date of joining", value: "doj" },
        { label: "Postal address", value: "postalAddress" },
        { label: "Pin code", value: "pinCode" },
      ],
    },
  };
  userProfile: any;
  payload: any = {};
  frameworkId: any;
  positions: any = [];
  // selectedAreasOfInterest: any = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  areasOfIntrestCtrl = new FormControl("");
  filteredAreas: Observable<string[]>;
  areas: string[] = [];
  knownLanguagesCtrl = new FormControl("");
  filteredLanguages: Observable<string[]>;
  languages: string[] = [];

  

  @ViewChild("areaInput") areaInput: ElementRef<HTMLInputElement>;
  @ViewChild("languageInput") languageInput: ElementRef<HTMLInputElement>;

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
    this.channelService
      .getFrameWork(this.activatedRoute.snapshot.queryParams.channel)
      .subscribe((res: any) => {
        // console.log("res", res);
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
    this.populateForm()
    this.areas =
      this.userProfile?.profileDetails?.areaOfInterest[0].skills || [];
    this.languages =
      this.userProfile?.profileDetails?.personalDetails.knownLanguages || [];
    // console.log('XX', this.selectedAreasOfInterest)
    // console.log('YY', this.userProfile?.profileDetails?.areaOfInterest[0].skills)
  }
  populateForm() {
    if (this.userProfile?.profileDetails?.professionalDetails) {
      const personalDetails = this.userProfile?.profileDetails?.personalDetails;
      const employmentDetails = this.userProfile?.profileDetails?.employmentDetails;
      const professionalDetails = this.userProfile?.profileDetails?.professionalDetails[0];
  
      this.form = this.formBuilder.group({
        firstName: [{ value: this.userProfile?.firstName, disabled: true }],
        lastName: [{ value: this.userProfile?.lastName, disabled: true }],
        countryCode: [this.userProfile?.countryCode],
        phone: [{ value: this.userProfile?.phone, disabled: true }],
        primaryEmail: [{ value: this.userProfile?.email, disabled: true }],
        secondaryEmail: [personalDetails?.secondaryEmail || ""],
        domicileMedium: [personalDetails?.domicileMedium || ""],
        otherLanguages: [personalDetails?.otherLanguages || ""],
        postalAddress: [personalDetails?.postalAddress || ""],
        pinCode: [personalDetails?.pinCode || ""],
        departmentName: [
          employmentDetails?.departmentName || "",
          Validators.required,
        ],
        designation: [
          professionalDetails?.designation || "",
          Validators.required,
        ],
        doj: [professionalDetails?.doj || ""],
      });
    } else {
      this.form = this.formBuilder.group({
        firstName: [{ value: this.userProfile?.firstName, disabled: true }],
        lastName: [{ value: this.userProfile?.lastName, disabled: true }],
        countryCode: [this.userProfile?.countryCode],
        phone: [{ value: this.userProfile?.phone, disabled: true }],
        primaryEmail: [{ value: this.userProfile?.email, disabled: true }],
        secondaryEmail: [""],
        domicileMedium: [""],
        otherLanguages: [""],
        postalAddress: [""],
        pinCode: [""],
        departmentName: ["", Validators.required],
        designation: ["", Validators.required],
        doj: [""],
      });
    }
  }
  
  add(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    // Add our fruit
    if (value) {
      this.areas.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.areasOfIntrestCtrl.setValue(null);
  }
  addLanguages(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    // Add our fruit
    if (value) {
      this.languages.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.knownLanguagesCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.areas.indexOf(fruit);

    if (index >= 0) {
      this.areas.splice(index, 1);
    }
  }
  removeLanguage(lan: string): void {
    const index = this.languages.indexOf(lan);

    if (index >= 0) {
      this.languages.splice(index, 1);
    }
  }

  selected(event: any): void {
    this.areas.push(event.option.viewValue);
    this.areaInput.nativeElement.value = "";
    this.areasOfIntrestCtrl.setValue(null);
  }
  selectedLanguages(event: any): void {
    this.languages.push(event.option.viewValue);
    this.languageInput.nativeElement.value = "";
    this.knownLanguagesCtrl.setValue(null);
  }


  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;
      this.payload.userId = this.userProfile.userId;

      const maskingPattern = /^\*{6}\d{4}$/;
      if (maskingPattern.test(this.payload.phone)) {
        delete this.payload.phone;
      }

      // let existingProfessionalDetails =
      //   this.userProfile.profileDetails?.professionalDetails || [];

      // let updatedProfessionalDetails = existingProfessionalDetails.map(
      //   (detail) => {
      //     if (detail.designation === null || detail.doj === null) {
      //       return {
      //         ...detail,
      //         designation: this.payload.designation || detail.designation,
      //         doj: this.payload.doj || detail.doj,
      //       };
      //     } else {
      //       return detail;
      //     }
      //   }
      // );

      // if (existingProfessionalDetails.length === 0) {
      //   updatedProfessionalDetails.push({
      //     designation: this.payload.designation || null,
      //     doj: this.payload.doj,
      //   });
      // }
      let existingProfessionalDetails =
      this.userProfile.profileDetails?.professionalDetails || [];

    let updatedProfessionalDetails = existingProfessionalDetails.map(
      (detail) => {
        // Update only if new values are provided, otherwise keep existing values
        return {
          ...detail,
          designation: this.payload.designation || detail.designation,
          doj: this.payload.doj || detail.doj,
        };
      }
    );

    if (existingProfessionalDetails.length === 0) {
      updatedProfessionalDetails.push({
        designation: this.payload.designation || null,
        doj: this.payload.doj,
      });
    }

      let profileDetails: any = {
        personalDetails: {
          firstname:this.userProfile?.firstName,
          lastname:this.userProfile?.lastName,
          mobile:this.userProfile?.phone,
          primaryEmail:this.userProfile?.userName,
          secondaryEmail: this.payload.secondaryEmail || "",
          domicileMedium: this.payload.domicileMedium || "",
          postalAddress: this.payload.postalAddress || "",
          pinCode: this.payload.pinCode || "",
          knownLanguages: this.languages || [],

        },
          areaOfInterest: [
          {
            skills:this.areas || [] }],
            employmentDetails: {
              ...this.userProfile.profileDetails?.employmentDetails,
              departmentName: this.payload.departmentName,
            },
        professionalDetails: updatedProfessionalDetails,
        
        
      };

      delete this.payload.domicileMedium;
      delete this.payload.otherLanguages;
      delete this.payload.postalAddress;
      delete this.payload.pinCode;
      delete this.payload.departmentName;
      delete this.payload.designation;
      delete this.payload.doj;
      delete this.payload.secondaryEmail;

      this.payload.profileDetails = {
        ...this.userProfile.profileDetails,
        ...profileDetails,
      };
      // console.log(this.payload.profileDetails)
      this.profileService.updatePrivateProfile(this.payload).subscribe(
        (res) => {
          this.toasterService.success(
            _.get(this.resourceService, "messages.smsg.m0059")
          );
        },
        (error) => {
          if (
            error &&
            error.error &&
            error.error.params &&
            error.error.params.errmsg
          ) {
            const errMsg = error.error.params.errmsg;

            if (errMsg === "Invalid format for given phone.") {
              this.toasterService.warning(
                _.get(this.resourceService, "messages.smsg.m0067")
              );
            } else if (errMsg === "phone already exists") {
              this.toasterService.warning(
                _.get(this.resourceService, "messages.smsg.m0068")
              );
            } else {
              this.toasterService.error(
                "Failed to update profile. Please try again."
              );
            }
          } else {
            this.toasterService.error(
              "Failed to update profile. Please try again."
            );
          }
        }
      );
    } else {
      const requiredFieldsEmpty = Object.keys(this.form.controls).some(
        (control) => this.form.get(control)?.hasError("required")
      );

      if (requiredFieldsEmpty) {
        this.toasterService.error(
          _.get(this.resourceService, "messages.smsg.m0069")
        );
      }
    }
  }
}
