import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBulkNFTComponent } from './list-bulk-nft.component';

describe('ListBulkNFTComponent', () => {
  let component: ListBulkNFTComponent;
  let fixture: ComponentFixture<ListBulkNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBulkNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBulkNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
