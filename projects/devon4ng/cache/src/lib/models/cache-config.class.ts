/**
 * Configuration class for Cache Service
 *
 * @export CacheServiceConfig
 */
export class CacheServiceConfig {
  maxCacheAge ? = 1800000;
  urlRegExp?: string | string[] | RegExp = new RegExp('http.*', 'g').toString();
}
