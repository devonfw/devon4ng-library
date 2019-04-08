import { Injectable, Optional } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CacheServiceConfig, CacheConfig } from './models/cache-config.class';
import { Cache, CacheEntry } from './models';

// NOTE: @types/object-hash not working to build libarary
const Hash: any = require('object-hash');

@Injectable({
  providedIn: 'root',
})
export class CacheService implements Cache, CacheConfig {
  cacheMap = new Map<string, CacheEntry>();
  urlRegExp: string | RegExp = new RegExp('http', 'g').toString();
  maxCacheAge = 1800000;

  constructor(@Optional() config: CacheServiceConfig) {
    if (config) {
      if (config.maxCacheAge) {
        this.maxCacheAge = config.maxCacheAge;
      }
      if (config.urlRegExp) {
        this.urlRegExp = config.urlRegExp;
      }
    }
  }

  get(key: string): HttpResponse<any> | null {
    const entry = this.cacheMap.get(key);
    if (!entry) {
      return null;
    }
    const isExpired = Date.now() - entry.entryTime > this.maxCacheAge;
    return isExpired ? null : entry.response;
  }

  put(req: HttpRequest<any>, res: HttpResponse<any>): void {
    const entry: CacheEntry = {
      url: req.urlWithParams,
      method: req.method,
      body: req.body ? req.body : {},
      response: res,
      entryTime: Date.now(),
    };
    this.cacheMap.set(this.createEntryHash(entry), entry);
    this.deleteExpiredCache();
  }

  createEntryHash(entry: CacheEntry): string {
    const hash = Hash({
      url: entry.url,
      method: entry.method,
      body: entry.body ? entry.body : {},
    });
    return `${hash}|${entry.method}|${entry.url}`;
  }

  cleanCache() {
    this.cacheMap.clear();
  }

  private deleteExpiredCache() {
    this.cacheMap.forEach((entry, key) => {
      if (Date.now() - entry.entryTime > this.maxCacheAge) {
        this.cacheMap.delete(key);
      }
    });
  }
}
