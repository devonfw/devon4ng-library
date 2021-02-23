import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AuthorizationModuleConfig,
  authorizationModuleConfigInjectionToken,
} from '../model/authorization-module-config';
import { AuthorizedRoute } from '../model/authorized-route';
import { IsAuthorized, isAuthorizedInjectionToken } from '../model/is-authorized';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(isAuthorizedInjectionToken) private readonly authorization: IsAuthorized<any>,
    @Inject(authorizationModuleConfigInjectionToken) private readonly config: AuthorizationModuleConfig
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentRouteConfig: AuthorizedRoute<any> = route && (route.routeConfig as AuthorizedRoute<any>);

    if (currentRouteConfig) {
      if (currentRouteConfig.permitAll) {
        return true;
      }
      const rightsToCheck = this.getRightsFrom(currentRouteConfig);
      if (rightsToCheck) {
        return this.authorization.isAuthorizedForRightsOf(rightsToCheck).pipe(
          catchError(() => of(false)),
          map((authorized) => {
            if (!authorized && this.config.urlOnAuthorizationFailure) {
              return this.router.parseUrl(this.config.urlOnAuthorizationFailure);
            }
            return authorized;
          })
        );
      }
    }

    return false;
  }

  private getRightsFrom(routeConfig: AuthorizedRoute<any>): any[] | null {
    const singleRightToCheckProvided = routeConfig.authorizeForRight != null; // for enum values it can be 0 which is falsy...
    const rightsProvided = routeConfig.authorizeForRightsOf && routeConfig.authorizeForRightsOf.length > 0;

    // take precedence of rights over a single one
    return rightsProvided
      ? routeConfig.authorizeForRightsOf
      : singleRightToCheckProvided
      ? [routeConfig.authorizeForRight]
      : null;
  }
}
