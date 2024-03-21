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
  selector: "app-certification-and-skills",
  templateUrl: "./certification-and-skills.component.html",
  styleUrls: ["./certification-and-skills.component.scss"],
})
export class CertificationAndSkillsComponent implements OnInit {
  form: FormGroup;
  formData = {
    colOne: {
      fields: [
        {
          label: "Additional skill acquired/Course completed",
          value: "additionalSkillCourse",
        },
        {
          label: "Provide certification details",
          value: "certificationDetails",
        },
      ],
    },
  };
  userProfile: any;
  payload: any = {};
  frameworkId: any;
  positions: any = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  professionalIntrestCtrl = new FormControl("");
  filteredProfessional: Observable<string[]>;
  professional: string[] = [];

  hobbiesCtrl = new FormControl("");
  filteredHobbies: Observable<string[]>;
  hobbies: string[] = [];

  @ViewChild("professionalInput") professionalInput: ElementRef<HTMLInputElement>;
  @ViewChild("hobbiesInput") hobbiesInput: ElementRef<HTMLInputElement>;


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
    this.populateForm()
    this.professional =
      this.userProfile?.profileDetails?.interests?.professional || [];
    this.hobbies =
      this.userProfile?.profileDetails?.interests?.hobbies || [];
  }
  populateForm() {
    if (this.userProfile?.profileDetails?.skills) {
      const skills = this.userProfile.profileDetails.skills;
  
      this.form = this.formBuilder.group({
        additionalSkillCourse: [skills?.additionalSkills || ""],
        certificationDetails: [skills?.certificateDetails || ""],
      });
    } else {
      this.form = this.formBuilder.group({
        additionalSkillCourse: [""],
        certificationDetails: [""],
      });
    }
  }
  
  addProfessional(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    // Add our fruit
    if (value) {
      this.professional.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.professionalIntrestCtrl.setValue(null);
  }
  addHobbies(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    // Add our fruit
    if (value) {
      this.hobbies.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.hobbiesCtrl.setValue(null);
  }

  removeProfessional(fruit: string): void {
    const index = this.professional.indexOf(fruit);

    if (index >= 0) {
      this.professional.splice(index, 1);
    }
  }
  removeHobbies(lan: string): void {
    const index = this.hobbies.indexOf(lan);

    if (index >= 0) {
      this.hobbies.splice(index, 1);
    }
  }

  selectedProfessionals(event: any): void {
    this.professional.push(event.option.viewValue);
    this.professionalInput.nativeElement.value = "";
    this.professionalIntrestCtrl.setValue(null);
  }
  selectedHobbies(event: any): void {
    this.hobbies.push(event.option.viewValue);
    this.hobbiesInput.nativeElement.value = "";
    this.hobbiesCtrl.setValue(null);
  }

  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;

      this.userService.userData$.subscribe((user: any) => {
        if (user && user.userProfile) {
          this.userProfile = user.userProfile;

          let skills: any = {
            additionalSkills: this.payload.additionalSkillCourse,
            certificateDetails: this.payload.certificationDetails,
          };
          let interests: any = {
            professional: this.professional,
            hobbies: this.hobbies,
          };

          this.userProfile.profileDetails = {
            ...this.userProfile.profileDetails,
            interests: {
              ...this.userProfile.profileDetails.interests,
              ...interests,
            },
            skills: {
              ...this.userProfile.profileDetails.skills,
              ...skills,
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
