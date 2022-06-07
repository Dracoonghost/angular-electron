import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateNftComponent } from './certificate-nft.component';

describe('CertificateNftComponent', () => {
  let component: CertificateNftComponent;
  let fixture: ComponentFixture<CertificateNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
