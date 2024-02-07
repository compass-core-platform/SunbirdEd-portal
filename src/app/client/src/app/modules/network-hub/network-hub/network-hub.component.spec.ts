import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkHubComponent } from './network-hub.component';

describe('NetworkHubComponent', () => {
  let component: NetworkHubComponent;
  let fixture: ComponentFixture<NetworkHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkHubComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
