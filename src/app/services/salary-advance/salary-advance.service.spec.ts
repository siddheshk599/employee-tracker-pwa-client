import { TestBed } from '@angular/core/testing';

import { SalaryAdvanceService } from './salary-advance.service';

describe('SalaryAdvanceService', () => {
  let service: SalaryAdvanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaryAdvanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
