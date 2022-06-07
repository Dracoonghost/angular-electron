import { TestBed } from '@angular/core/testing';

import { HashFileService } from './hash-file.service';

describe('HashFileService', () => {
  let service: HashFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
