/**
 * Configuration class for Cache Service
 *
 * @export CacheServiceConfig
 */
export class CacheServiceConfig {
  maxCacheAge ? = 1800000;
  urlRegExp?: string | RegExp = new RegExp('http.*', 'g').toString();
}
