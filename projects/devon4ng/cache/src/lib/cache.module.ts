import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf,
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CacheServiceConfig } from './models/cache-config.class';

@NgModule({
  declarations: [],
  imports: [HttpClientModule],
  exports: [],
})
export class CacheModule {
  constructor(@Optional() @SkipSelf() parentModule: CacheModule) {
    if (parentModule) {
      throw new Error('CacheModule is already loaded. Import it only once.');
    }
  }

  static forRoot(config: CacheServiceConfig): ModuleWithProviders {
    return {
      ngModule: CacheModule,
      providers: [{ provide: CacheServiceConfig, useValue: config }],
    };
  }
}
