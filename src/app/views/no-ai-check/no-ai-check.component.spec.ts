import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoAiCheckComponent } from './no-ai-check.component';

describe('NoAiCheckComponent', () => {
  let component: NoAiCheckComponent;
  let fixture: ComponentFixture<NoAiCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoAiCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoAiCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
