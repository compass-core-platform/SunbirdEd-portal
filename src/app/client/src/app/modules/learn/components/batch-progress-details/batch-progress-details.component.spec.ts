import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchProgressDetailsComponent } from './batch-progress-details.component';

describe('BatchProgressDetailsComponent', () => {
  let component: BatchProgressDetailsComponent;
  let fixture: ComponentFixture<BatchProgressDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchProgressDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchProgressDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
