import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNotificationComponent } from './custom-notification.component';

describe('CustomNotificationComponent', () => {
  let component: CustomNotificationComponent;
  let fixture: ComponentFixture<CustomNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomNotificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
