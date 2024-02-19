import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPortalHomeComponent } from './admin-portal-home.component';

describe('AdminPortalHomeComponent', () => {
  let component: AdminPortalHomeComponent;
  let fixture: ComponentFixture<AdminPortalHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPortalHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPortalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
