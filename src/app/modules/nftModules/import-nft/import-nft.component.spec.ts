import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportNFTComponent } from './import-nft.component';

describe('ImportNFTComponent', () => {
  let component: ImportNFTComponent;
  let fixture: ComponentFixture<ImportNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
