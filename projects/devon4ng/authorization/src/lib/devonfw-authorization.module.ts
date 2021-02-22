import { ModuleWithProviders, NgModule } from '@angular/core';
import { isAuthorizedInjectionToken } from './model/is-authorized';
import { AuthorizedForAnyRight } from './service/authorized-for-any-right.service';
import {
  AuthorizationModuleConfig,
  authorizationModuleConfigInjectionToken,
} from './model/authorization-module-config';

@NgModule()
export class DevonfwAuthorizationModule {
  static forRoot(config?: AuthorizationModuleConfig): ModuleWithProviders<DevonfwAuthorizationModule> {
    return {
      ngModule: DevonfwAuthorizationModule,
      providers: [
        { provide: authorizationModuleConfigInjectionToken, useValue: config || {} },
        { provide: isAuthorizedInjectionToken, useClass: AuthorizedForAnyRight },
      ],
    };
  }
}
