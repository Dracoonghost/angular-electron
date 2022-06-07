import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBulkNFTComponent } from './view-bulk-nft.component';

describe('ViewBulkNFTComponent', () => {
  let component: ViewBulkNFTComponent;
  let fixture: ComponentFixture<ViewBulkNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBulkNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBulkNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
