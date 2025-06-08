import { TestBed } from '@angular/core/testing';
import { FileOperationsService } from './file-operations.service';

describe('FileOperationsService', () => {
  let service: FileOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
