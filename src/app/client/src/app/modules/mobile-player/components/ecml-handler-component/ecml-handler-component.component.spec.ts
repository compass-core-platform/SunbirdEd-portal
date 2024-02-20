import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmlHandlerComponentComponent } from './ecml-handler-component.component';

describe('EcmlHandlerComponentComponent', () => {
  let component: EcmlHandlerComponentComponent;
  let fixture: ComponentFixture<EcmlHandlerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcmlHandlerComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcmlHandlerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
