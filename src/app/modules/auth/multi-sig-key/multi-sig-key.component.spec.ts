import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSigKeyComponent } from './multi-sig-key.component';

describe('MultiSigKeyComponent', () => {
  let component: MultiSigKeyComponent;
  let fixture: ComponentFixture<MultiSigKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiSigKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSigKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
