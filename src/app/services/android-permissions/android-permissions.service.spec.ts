import { TestBed } from '@angular/core/testing';

import { AndroidPermissionsService } from './android-permissions.service';

describe('AndroidPermissionsService', () => {
  let service: AndroidPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AndroidPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
