import { TestBed } from '@angular/core/testing';

import { AdminManagerAuthGuardService } from './admin-manager-auth-guard.service';

describe('AdminManagerAuthGuardService', () => {
  let service: AdminManagerAuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminManagerAuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
