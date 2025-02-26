import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPrescriptionComponent } from './verify-prescription.component';

describe('VerifyPrescriptionComponent', () => {
  let component: VerifyPrescriptionComponent;
  let fixture: ComponentFixture<VerifyPrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyPrescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
