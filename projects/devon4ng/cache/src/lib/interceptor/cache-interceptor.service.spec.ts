import { TestBed } from '@angular/core/testing';

import { CachingInterceptorService } from './cache-interceptor.service';

describe('CachingInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CachingInterceptorService = TestBed.get(CachingInterceptorService);
    expect(service).toBeTruthy();
  });
});
