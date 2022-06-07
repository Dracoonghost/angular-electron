import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptPrivateKeysComponent } from './encrypt-private-keys.component';

describe('EncryptPrivateKeysComponent', () => {
  let component: EncryptPrivateKeysComponent;
  let fixture: ComponentFixture<EncryptPrivateKeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncryptPrivateKeysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptPrivateKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
