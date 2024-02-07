import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhishlistCoursesComponent } from './whishlist-courses.component';

describe('WhishlistCoursesComponent', () => {
  let component: WhishlistCoursesComponent;
  let fixture: ComponentFixture<WhishlistCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhishlistCoursesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhishlistCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
