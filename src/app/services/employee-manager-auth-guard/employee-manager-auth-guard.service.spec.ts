import { TestBed } from '@angular/core/testing';

import { EmployeeManagerAuthGuardService } from './employee-manager-auth-guard.service';

describe('EmployeeManagerAuthGuardService', () => {
  let service: EmployeeManagerAuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeManagerAuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
