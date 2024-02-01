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
    colTwo: {
      fields: [
        { label: "Professional interests", value: "professionalInterests" },
        { label: "Hobbies", value: "hobbies" },
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
      additionalSkillCourse: [
        this.userProfile?.profileDetails?.certificateSkills
          ?.additionalSkillCourse || "",
      ],
      certificationDetails: [
        this.userProfile?.profileDetails?.certificateSkills
          ?.certificationDetails || "",
      ],

      // Second Column
      professionalInterests: [
        this.userProfile?.profileDetails?.certificateSkills
          ?.professionalInterests || "",
      ],
      hobbies: [
        this.userProfile?.profileDetails?.certificateSkills?.hobbies || "",
      ],
    });
  }

  onSubmit(request) {
    if (this.form.valid) {
      this.payload = this.form.value;

      this.userService.userData$.subscribe((user: any) => {
        if (user && user.userProfile) {
          this.userProfile = user.userProfile;

          let certificationSkills: any = {
            additionalSkillCourse: this.payload.additionalSkillCourse,
            certificationDetails: this.payload.certificationDetails,
            professionalInterests: this.payload.professionalInterests,
            hobbies: this.payload.hobbies,
          };

          this.userProfile.profileDetails = {
            ...this.userProfile.profileDetails,
            certificateSkills: {
              ...this.userProfile.profileDetails.certificateSkills,
              ...certificationSkills,
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
