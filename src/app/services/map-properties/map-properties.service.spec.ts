import { TestBed } from '@angular/core/testing';

import { MapPropertiesService } from './map-properties.service';

describe('MapPropertiesService', () => {
  let service: MapPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
