/**
 * CacheConfig interface
 *
 * @export CacheConfig
 */
export interface CacheConfig {
  maxCacheAge?: number;
  urlRegExp?: string | RegExp;
}

/**
 * Configuration class for Cache Service
 *
 * @export CacheServiceConfig
 */
export abstract class CacheServiceConfig implements CacheConfig {
  maxCacheAge?: number;
  urlRegExp?: string | RegExp;
}
