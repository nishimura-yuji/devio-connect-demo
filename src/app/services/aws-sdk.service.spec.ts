import { TestBed } from '@angular/core/testing';

import { AwsSdkService } from './aws-sdk.service';

describe('AwsSdkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwsSdkService = TestBed.get(AwsSdkService);
    expect(service).toBeTruthy();
  });
});
