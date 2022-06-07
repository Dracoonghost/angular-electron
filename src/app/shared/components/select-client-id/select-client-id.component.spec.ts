import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectClientIDComponent } from './select-client-id.component';

describe('SelectClientIDComponent', () => {
  let component: SelectClientIDComponent;
  let fixture: ComponentFixture<SelectClientIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectClientIDComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectClientIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
