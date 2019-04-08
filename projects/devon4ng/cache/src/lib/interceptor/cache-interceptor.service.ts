import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';

@Injectable({
  providedIn: 'root',
})
export class CachingInterceptorService implements HttpInterceptor {
  constructor(private cache: CacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRequestCachable(req)) {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(
      this.cache.createEntryHash({
        url: req.urlWithParams,
        method: req.method,
        body: req.body ? req.body : {},
      }),
    );
    if (cachedResponse !== null) {
      return of(cachedResponse);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.put(req, event);
        }
      }),
    );
  }

  private isRequestCachable(req: HttpRequest<any>): boolean {
    return (
      req.method !== 'DELETE' && req.url.match(this.cache.urlRegExp).length > 0
    );
  }
}
