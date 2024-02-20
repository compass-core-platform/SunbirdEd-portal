import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAssessmentProgressComponent } from './course-assessment-progress.component';

describe('CourseAssessmentProgressComponent', () => {
  let component: CourseAssessmentProgressComponent;
  let fixture: ComponentFixture<CourseAssessmentProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseAssessmentProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseAssessmentProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
