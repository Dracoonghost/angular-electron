import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsidListComponent } from './ssid-list.component';

describe('SsidListComponent', () => {
  let component: SsidListComponent;
  let fixture: ComponentFixture<SsidListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SsidListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SsidListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
