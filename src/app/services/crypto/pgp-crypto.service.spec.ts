import { TestBed } from '@angular/core/testing';

import { PgpCryptoService } from './pgp-crypto.service';

describe('PgpCryptoService', () => {
  let service: PgpCryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PgpCryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
