import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliableBlockChainComponent } from './avaliable-block-chain.component';

describe('AvaliableBlockChainComponent', () => {
  let component: AvaliableBlockChainComponent;
  let fixture: ComponentFixture<AvaliableBlockChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvaliableBlockChainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvaliableBlockChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
