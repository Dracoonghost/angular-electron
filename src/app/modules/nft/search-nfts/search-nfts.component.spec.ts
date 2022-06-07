import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchNftsComponent } from './search-nfts.component';

describe('SearchNftsComponent', () => {
  let component: SearchNftsComponent;
  let fixture: ComponentFixture<SearchNftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchNftsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchNftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
