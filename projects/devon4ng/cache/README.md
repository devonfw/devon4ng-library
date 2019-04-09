# Cache Module

Use this devon4ng Angular module when you want to cache requests to server. You may configure it to store in cache only the requests you need and to set the duration you want.

## Installation

```bash
$ npm i @devon4ng/cache
```

Or you can use **yarn:**

```bash
$ yarn add @devon4ng/cache
```

## Usage

Import the dependency in your `app.module.ts`:

```typescript
import { CacheModule } from '@devon4ng/cache';
```

Import and configure it in the `@NgModule` imports section:

```typescript
@NgModule({
  ...
  imports: [
    ...otherModules,
    CacheModule.forRoot({
      maxCacheAge: 1800000, // number
      urlRegExp: new RegExp('http', 'g').toString(); // RegExp object or string
    }),
  ]
})
```

The configuration object defines the following two parameters:

- `maxCacheAge`: Age in milliseconds. After that the cache entry will be developed. By default `1800000` or 30 minutes.
- `urlRegExp`: Regular expression as `string` or `RegExp` object that defines which URLs are going to be cached. By default any URL that contains `http`, that is **all the URLs**.
