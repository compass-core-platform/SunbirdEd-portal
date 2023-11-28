import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-competency-passbook',
  templateUrl: './competency-passbook.component.html',
  styleUrls: ['./competency-passbook.component.scss']
})
export class CompetencyPassbookComponent implements OnInit {

  breadCrumbData: any = [
    {
      "label": "Learn",
      "status": "inactive",
      "link": "resources",
      "icon": "school"
    },
    {
      "label": "Competency passbook",
      "status": "active",
      "link": "",
      "icon": "extension"
    }
  ];
  constructor() { }

  ngOnInit(): void {
    // this.breadCrumbData = [
    //   {
    //     "label": "Learn",
    //     "status": "inactive",
    //     "link": "resources",
    //     "icon": "school"
    //   },
    //   {
    //     "label": "Competency passbook",
    //     "status": "active",
    //     "link": "competency-passbook",
    //     "icon": "extension"
    //   }
    // ];
  }

}
