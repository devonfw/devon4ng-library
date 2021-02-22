import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf,
} from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheServiceConfig } from './models/cache-config.class';
import { CacheInterceptorService } from './interceptor/cache-interceptor.service';
import { CacheService } from './cache.service';

@NgModule({
  declarations: [],
  imports: [HttpClientModule],
  providers: [
    CacheService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptorService,
      multi: true,
    },
  ],
  exports: [],
})
export class CacheModule {
  constructor(@Optional() @SkipSelf() parentModule: CacheModule) {
    if (parentModule) {
      throw new Error('CacheModule is already loaded. Import it only once.');
    }
  }

  static forRoot(config: CacheServiceConfig): ModuleWithProviders<CacheModule> {
    return {
      ngModule: CacheModule,
      providers: [{ provide: CacheServiceConfig, useValue: config }],
    };
  }
}
