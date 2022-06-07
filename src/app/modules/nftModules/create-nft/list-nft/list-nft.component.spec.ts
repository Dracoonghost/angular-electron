import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNftComponent } from './list-nft.component';

describe('ListNftComponent', () => {
  let component: ListNftComponent;
  let fixture: ComponentFixture<ListNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
