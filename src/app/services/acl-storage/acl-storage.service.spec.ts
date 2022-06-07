import { TestBed } from '@angular/core/testing';

import { AclStorageService } from './acl-storage.service';

describe('AclStorageService', () => {
  let service: AclStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AclStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
