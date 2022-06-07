import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSsidComponent } from './create-ssid.component';

describe('CreateSsidComponent', () => {
  let component: CreateSsidComponent;
  let fixture: ComponentFixture<CreateSsidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSsidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSsidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
