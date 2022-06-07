import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffMemberAddComponent } from './staff-member-add.component';

describe('StaffMemberAddComponent', () => {
  let component: StaffMemberAddComponent;
  let fixture: ComponentFixture<StaffMemberAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffMemberAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffMemberAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
