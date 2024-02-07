import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseDiscussionForumComponent } from './course-discussion-forum.component';

describe('CourseDiscussionForumComponent', () => {
  let component: CourseDiscussionForumComponent;
  let fixture: ComponentFixture<CourseDiscussionForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseDiscussionForumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseDiscussionForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
