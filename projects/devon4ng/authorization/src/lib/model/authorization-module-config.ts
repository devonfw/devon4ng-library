import { InjectionToken } from '@angular/core';

export const authorizationModuleConfigInjectionToken = new InjectionToken<AuthorizationModuleConfig>('module-config');

export interface AuthorizationModuleConfig {
  urlOnAuthorizationFailure?: string;
}
