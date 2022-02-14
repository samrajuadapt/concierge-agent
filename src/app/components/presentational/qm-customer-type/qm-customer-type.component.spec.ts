import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QmCustomerTypeComponent } from './qm-customer-type.component';

describe('QmCustomerTypeComponent', () => {
  let component: QmCustomerTypeComponent;
  let fixture: ComponentFixture<QmCustomerTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QmCustomerTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QmCustomerTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
