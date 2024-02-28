import { Component, OnInit } from '@angular/core';
import { taxonomyEnvironment, taxonomyConfig } from '../../../../framework.config';
import { TaxonomyService } from '../../../../service/taxonomy.service';

@Component({
  selector: 'app-taxonomy-view-wrap',
  templateUrl: './taxonomy-view-wrap.component.html',
  styleUrls: ['./taxonomy-view-wrap.component.scss']
})

export class TaxonomyViewWrapComponent implements OnInit {
  environment = taxonomyEnvironment;
  taxonomyConfig = taxonomyConfig;
  loading = false;
  constructor(private taxonomyService: TaxonomyService) { }

  ngOnInit(): void {
    this.environment = JSON.parse(localStorage.getItem('environment'));
    this.taxonomyService.getPortalToken().subscribe((res) => {
      this.environment.authToken = 'Bearer ' + res; 
      this.loading = true;
    });
  }
}