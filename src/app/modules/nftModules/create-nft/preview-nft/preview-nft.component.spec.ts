import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewNftComponent } from './preview-nft.component';

describe('PreviewNftComponent', () => {
  let component: PreviewNftComponent;
  let fixture: ComponentFixture<PreviewNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
