import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencyPassbookComponent } from './competency-passbook.component';

describe('CompetencyPassbookComponent', () => {
  let component: CompetencyPassbookComponent;
  let fixture: ComponentFixture<CompetencyPassbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompetencyPassbookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetencyPassbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
