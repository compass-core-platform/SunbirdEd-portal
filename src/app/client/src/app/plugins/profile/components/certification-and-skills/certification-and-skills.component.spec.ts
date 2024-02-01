import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationAndSkillsComponent } from './certification-and-skills.component';

describe('CertificationAndSkillsComponent', () => {
  let component: CertificationAndSkillsComponent;
  let fixture: ComponentFixture<CertificationAndSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificationAndSkillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationAndSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
