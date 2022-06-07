import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkNFTComponent } from './bulk-nft.component';

describe('BulkNFTComponent', () => {
  let component: BulkNFTComponent;
  let fixture: ComponentFixture<BulkNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
