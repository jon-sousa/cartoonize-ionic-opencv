import { TestBed } from '@angular/core/testing';

import { OpencvServiceService } from './opencv-service.service';

describe('OpencvServiceService', () => {
  let service: OpencvServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpencvServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
