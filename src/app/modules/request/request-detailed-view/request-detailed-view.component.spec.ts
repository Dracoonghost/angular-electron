import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailedViewComponent } from './request-detailed-view.component';

describe('RequestDetailedViewComponent', () => {
  let component: RequestDetailedViewComponent;
  let fixture: ComponentFixture<RequestDetailedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestDetailedViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDetailedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
