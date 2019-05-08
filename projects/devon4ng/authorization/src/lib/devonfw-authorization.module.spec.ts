import { Component } from '@angular/core';
import { fakeAsync, TestBed, TestModuleMetadata, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthorizedRoutes } from './model/authorized-route';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { addAuthorizationGuards } from './utils/add-authorization-guards';
import { DevonfwAuthorizationModule } from './devonfw-authorization.module';
import { IsAuthorized, isAuthorizedInjectionToken } from './model/is-authorized';
import { Observable, of, throwError } from 'rxjs';
import { AuthorizationModuleConfig } from './model/authorization-module-config';

@Component({
  selector: 'daon-my-test-app',
  template: '<router-outlet></router-outlet>'
})
class MyTestAppComponent {
}

@Component({
  selector: 'daon-my-test-page',
  template: ''
})
export class MyTestPageComponent {
}

enum Right {
  User, Admin
}

enum Paths {
  ACCESS_DENIED = 'access-denied',
  PUBLIC_PAGE = 'public-test-page',
  PROTECTED_USER_PAGE = 'protected-user-test-page',
  PROTECTED_ADMIN_PAGE = 'protected-admin-test-page',
  NOT_ACCESSIBLE_PAGE = 'not-accessible-test-page'
}

const routes: AuthorizedRoutes<Right> = [
  {
    path: Paths.ACCESS_DENIED,
    component: MyTestPageComponent,
    permitAll: true
  },
  {
    path: Paths.PUBLIC_PAGE,
    component: MyTestPageComponent,
    permitAll: true
  },
  {
    path: Paths.PROTECTED_USER_PAGE,
    component: MyTestPageComponent,
    authorizeForRight: Right.User
  },
  {
    path: Paths.PROTECTED_ADMIN_PAGE,
    component: MyTestPageComponent,
    authorizeForRightsOf: [Right.User, Right.Admin]
  },
  {
    path: Paths.NOT_ACCESSIBLE_PAGE,
    component: MyTestPageComponent
  }
];

describe('DevonfwAuthorizationModule', () => {
  describe('(with minimal configuration - everyone is authorized)', () => {
    beforeEach(() => {
      configureTestingModule<Right>().withDummyAuthorization();
    });

    it('allows navigating to a public route', fakeAsync(() => {
      // given
      const publicTestPageUrl = `/${Paths.PUBLIC_PAGE}`;
      // when
      whenNavigateTo([publicTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(publicTestPageUrl);
    }));

    it('allows navigating to a protected USER route', fakeAsync(() => {
      // given
      const protectedTestPageUrl = `/${Paths.PROTECTED_USER_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(protectedTestPageUrl);
    }));

    it('allows navigating to a protected ADMIN route', fakeAsync(() => {
      // given
      const protectedTestPageUrl = `/${Paths.PROTECTED_ADMIN_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(protectedTestPageUrl);
    }));

    it('protects routes without configuration', fakeAsync(() => {
      // given
      const protectedTestPageUrl = `/${Paths.NOT_ACCESSIBLE_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual('/');
    }));
  });

  describe('(with own AuthorizationService)', () => {
    it('allows unauthorized users navigating to a public route', fakeAsync(() => {
      // given
      configureTestingModule<Right>().forUnauthorizedUsers();
      const publicTestPageUrl = `/${Paths.PUBLIC_PAGE}`;
      // when
      whenNavigateTo([publicTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(publicTestPageUrl);
    }));

    it('allows authorized users to navigate to a protected USER route', fakeAsync(() => {
      // given
      configureTestingModule<Right>().forUserHavingRightsOf([Right.User]);
      const protectedTestPageUrl = `/${Paths.PROTECTED_USER_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(protectedTestPageUrl);
    }));

    it('allows authorized users navigating to a protected ADMIN route', fakeAsync(() => {
      // given
      configureTestingModule<Right>().forUserHavingRightsOf([Right.User, Right.Admin]);
      const protectedTestPageUrl = `/${Paths.PROTECTED_ADMIN_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(protectedTestPageUrl);
    }));

    it('does not allow unauthorized users to navigate to a protected ADMIN route', fakeAsync(() => {
      // given
      configureTestingModule<Right>().forUserHavingRightsOf([Right.User]);
      const protectedTestPageUrl = `/${Paths.PROTECTED_ADMIN_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual('/');
    }));

    it('protects routes when authorization fails', fakeAsync(() => {
      // given
      configureTestingModule<Right>().withFailingAuthorization();
      const protectedTestPageUrl = `/${Paths.PROTECTED_ADMIN_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual('/');
    }));

    it('redirects to a configured page upon unauthorized access', fakeAsync(() => {
      // given
      const accessDeniedPageUrl = `/${Paths.ACCESS_DENIED}`;
      configureTestingModule<Right>({urlOnAuthorizationFailure: accessDeniedPageUrl}).forUserHavingRightsOf([Right.User]);
      const protectedTestPageUrl = `/${Paths.PROTECTED_ADMIN_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual(accessDeniedPageUrl);
    }));

    it('protects routes without configuration even for authorized users', fakeAsync(() => {
      // given
      configureTestingModule<Right>().forUserHavingRightsOf([Right.User, Right.Admin]);
      const protectedTestPageUrl = `/${Paths.NOT_ACCESSIBLE_PAGE}`;
      // when
      whenNavigateTo([protectedTestPageUrl])
      // then
        .thenExpectLocationPathToEqual('/');
    }));
  });
});

function whenNavigateTo(commands: any[]) {
  const appComponentFixture = TestBed.createComponent(MyTestAppComponent);
  const router: Router = TestBed.get(Router);
  const location: Location = TestBed.get(Location);

  return {
    thenExpectLocationPathToEqual(path: string) {
      appComponentFixture.ngZone.run(() => {
        // when
        router.navigate(commands);
        tick();
        appComponentFixture.detectChanges();
        appComponentFixture.whenStable().then(() => {
          // then
          expect(location.path()).toEqual(path);
        });
      });
    }
  };
}

function configureTestingModule<R>(config?: AuthorizationModuleConfig) {
  function configureTestingModuleProvidingMock(authorizationServiceMock?: IsAuthorized<R>) {
    const testingModuleDefinition: TestModuleMetadata = {
      declarations: [MyTestAppComponent, MyTestPageComponent],
      imports: [
        RouterTestingModule.withRoutes(routes),
        DevonfwAuthorizationModule.forRoot(config)
      ]
    };

    if (authorizationServiceMock) {
      testingModuleDefinition.providers = [{provide: isAuthorizedInjectionToken, useValue: authorizationServiceMock}];
    }

    TestBed.configureTestingModule(testingModuleDefinition);
    const router: Router = TestBed.get(Router);
    addAuthorizationGuards(router);
  }

  return {
    withDummyAuthorization() {
      configureTestingModuleProvidingMock();
    },

    withFailingAuthorization() {
      configureTestingModuleProvidingMock(
        createAuthorizationServiceMock<R>().whichFails());
    },

    forUserHavingRightsOf(userRights: R[]) {
      configureTestingModuleProvidingMock(
        createAuthorizationServiceMock<R>().forUserHavingRightsOf(userRights));
    },

    forUnauthorizedUsers() {
      configureTestingModuleProvidingMock(
        createAuthorizationServiceMock<R>().forUnauthorizedUsers());
    }
  };
}

export function createAuthorizationServiceMock<R>() {
  return {
    forUserHavingRightsOf(userRights: R[]): IsAuthorized<R> {
      return {
        isAuthorizedForRightsOf(requiredRights: R[]): Observable<boolean> {
          let isAuthorized = true;

          if (requiredRights && requiredRights.length > 0) {
            isAuthorized = requiredRights.reduce((requiredAuthorizationFulfilled, requiredRight) =>
                requiredAuthorizationFulfilled ? (userRights ? userRights.includes(requiredRight) : false) : false,
              true);
          }

          return of(isAuthorized);
        }
      };
    },

    forUnauthorizedUsers(): IsAuthorized<R> {
      return {
        isAuthorizedForRightsOf(): Observable<boolean> {
          return of(false);
        }
      };
    },

    whichFails(): IsAuthorized<R> {
      return {
        isAuthorizedForRightsOf(): Observable<boolean> {
          return throwError(new Error());
        }
      };
    }
  };
}
