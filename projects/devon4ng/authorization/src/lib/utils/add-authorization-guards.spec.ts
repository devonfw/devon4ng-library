import { addAuthorizationGuards, ConfigAwareRouter } from './add-authorization-guards';
import { Routes } from '@angular/router';
import { AuthorizedRoutes } from '../model/authorized-route';
import { MyTestPageComponent } from '../devonfw-authorization.module.spec';
import { AuthorizationGuard } from '../guard/authorization.guard';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('addAuthorizationGuards', () => {
  describe('(simple route structure)', () => {
    it('does nothing if routes not provided', () => {
      // given
      const routerMock = createRouterMockWith(null);
      // when
      addAuthorizationGuards(routerMock);
      // then
      expect(routerMock.resetConfig).not.toHaveBeenCalled();
    });

    it('adds a guard to a route having a path and a component set', () => {
      // given
      const routes: AuthorizedRoutes<any> = [
        {
          path: 'some-path',
          component: MyTestPageComponent,
          permitAll: true,
        },
      ];
      const routerMock = createRouterMockWith(routes);
      // when
      addAuthorizationGuards(routerMock);
      // then
      const resultRoutes = getResultRoutes(routerMock);
      expect(resultRoutes[0].canActivate).toContain(AuthorizationGuard);
    });

    it('does not add a guard to a route not having a path and a component set', () => {
      // given
      const routes: AuthorizedRoutes<any> = [
        { path: '', pathMatch: 'full', redirectTo: '/some-path' },
        {
          path: 'some-path',
          component: MyTestPageComponent,
          permitAll: true,
        },
      ];
      const routerMock = createRouterMockWith(routes);
      // when
      addAuthorizationGuards(routerMock);
      // then
      const resultRoutes = getResultRoutes(routerMock);
      expect(resultRoutes[0].canActivate).toBeUndefined();
    });
  });

  describe('(tree route structure)', () => {
    let treeStructureRoutes: AuthorizedRoutes<any>;

    beforeEach(() => {
      treeStructureRoutes = [
        { path: '', pathMatch: 'full', redirectTo: '/my-app/some-path' },
        {
          path: 'my-app',
          children: [
            {
              path: '', // home
              component: MyTestPageComponent,
            },
            {
              path: 'first-level',
              component: MyTestPageComponent,
              children: [
                {
                  path: 'second-level-1',
                  component: MyTestPageComponent,
                },
                {
                  path: 'second-level-2',
                  component: MyTestPageComponent,
                },
              ],
            },
          ],
        },
      ];
    });

    it('adds guards according to the default strategy', () => {
      // given
      const routerMock = createRouterMockWith(treeStructureRoutes);
      // when
      addAuthorizationGuards(routerMock);
      // then
      const resultRoutes = getResultRoutes(routerMock);
      expect(resultRoutes[0].canActivate).toBeUndefined();
      expect(resultRoutes[1].canActivate).toBeUndefined();
      expect(resultRoutes[1].children[0].canActivate).toContain(AuthorizationGuard, 'my-app has no guard');
      expect(resultRoutes[1].children[1].canActivate).toContain(AuthorizationGuard, 'my-app/first-level has no guard');
      expect(resultRoutes[1].children[1].children[0].canActivate).toContain(
        AuthorizationGuard,
        'my-app/first-level/second-level-1 has no guard'
      );
      expect(resultRoutes[1].children[1].children[1].canActivate).toContain(
        AuthorizationGuard,
        'my-app/first-level/second-level-2 has no guard'
      );
    });

    it('adds guards according to provided strategy', () => {
      // given
      const routerMock = createRouterMockWith(treeStructureRoutes);
      const addGuardWhenPathAndComponentProvidedButNoChildren = (route) =>
        route.path != null && route.component && route.children == null;
      // when
      addAuthorizationGuards(routerMock, addGuardWhenPathAndComponentProvidedButNoChildren);
      // then
      const resultRoutes = getResultRoutes(routerMock);
      expect(resultRoutes[0].canActivate).toBeUndefined();
      expect(resultRoutes[1].canActivate).toBeUndefined();
      expect(resultRoutes[1].children[0].canActivate).toContain(AuthorizationGuard, 'my-app has no guard');
      expect(resultRoutes[1].children[1].canActivate).toBeUndefined();
      expect(resultRoutes[1].children[1].children[0].canActivate).toContain(
        AuthorizationGuard,
        'my-app/first-level/second-level-1 has no guard'
      );
      expect(resultRoutes[1].children[1].children[1].canActivate).toContain(
        AuthorizationGuard,
        'my-app/first-level/second-level-2 has no guard'
      );
    });
  });
});

function createRouterMockWith(routes: Routes): ConfigAwareRouter {
  return {
    config: routes,
    resetConfig: createSpy('resetConfig'),
  };
}

function getResultRoutes(routerMock: ConfigAwareRouter): Routes {
  const resetConfigSpy = routerMock.resetConfig as Spy;
  expect(resetConfigSpy).toHaveBeenCalled();

  const callArgs: any[] = resetConfigSpy.calls.first().args;
  expect(callArgs && callArgs.length > 0).toBeTruthy('resetConfig called without arguments');

  return callArgs[0] as Routes;
}
