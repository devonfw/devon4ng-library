import { AuthorizationGuard } from './authorization.guard';
import { createAuthorizationServiceMock } from '../devonfw-authorization.module.spec';

describe('AuthorizationGuard', () => {
  it('denies access if no route config provided', () => {
    // given
    const routerMock: any = jasmine.createSpyObj('router', ['parseUrl']);
    const authorizationServiceMock = createAuthorizationServiceMock().forUnauthorizedUsers();
    const guard = new AuthorizationGuard(routerMock, authorizationServiceMock, {});

    const routeWithoutConfig: any = {};
    // when
    const canActivate = guard.canActivate(routeWithoutConfig);
    // then
    expect(canActivate).toBeFalsy();
  });
});
