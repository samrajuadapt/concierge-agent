import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QmServiceGroupComponent } from './qm-service-group.component';

describe('QmServiceGroupComponent', () => {
  let component: QmServiceGroupComponent;
  let fixture: ComponentFixture<QmServiceGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QmServiceGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QmServiceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
