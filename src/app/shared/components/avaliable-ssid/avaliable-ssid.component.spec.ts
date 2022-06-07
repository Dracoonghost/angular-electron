import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliableSSIDComponent } from './avaliable-ssid.component';

describe('AvaliableSSIDComponent', () => {
  let component: AvaliableSSIDComponent;
  let fixture: ComponentFixture<AvaliableSSIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvaliableSSIDComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvaliableSSIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
