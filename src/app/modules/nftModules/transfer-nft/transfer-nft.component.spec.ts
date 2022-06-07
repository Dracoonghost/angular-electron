import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferNftComponent } from './transfer-nft.component';

describe('TransferNftComponent', () => {
  let component: TransferNftComponent;
  let fixture: ComponentFixture<TransferNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
