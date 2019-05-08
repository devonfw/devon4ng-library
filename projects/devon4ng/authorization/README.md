# Authorization Module

This `devon4ng` Angular module allows you to configure what authorization rights (if any) are required to access your routes.

## Installation

```bash
$ npm install @devon4ng/authorization --save
```

Or you can use **yarn:**

```bash
$ yarn add @devon4ng/authorization
```

## Usage

#### 1. Configure the router

This `devon4ng` Authorization Module depends on the Angular's `RouterModule`, so configure your router first - if you haven't done it yet :), e.g.:

```ts
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Dialog1Component} from './components/dialog1/dialog1.component';
import {Dialog2Component} from './components/dialog2/dialog2.component';

const routes: Routes = [
  {
    path: 'dialog1',
    component: Dialog1Component
  },
  {
    path: 'dialog2',
    component: Dialog2Component
  },
  {path: '', pathMatch: 'full', redirectTo: '/dialog1'}
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 2. Import `DevonfwAuthorizationModule.forRoot()`:

Similarly to the `RouterModule` you have to import `DevonfwAuthorizationModule.forRoot()` in the root `@NgModule` of your application.

```ts
import {DevonfwAuthorizationModule} from '@devon4ng/authorization';

const routes = ...

@NgModule({
  imports: [
    ...
    RouterModule.forRoot(routes),
    DevonfwAuthorizationModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 3. Configure what access rights require your routes:

```ts
import {AuthorizedRoutes} from '@devon4ng/authorization';

enum Right {
  User, Admin
}

const routes: AuthorizedRoutes<Right> = [
  {
    path: 'dialog1',
    component: Dialog1Component,
    authorizeForRight: Right.User
  },
  {
    path: 'dialog2',
    component: Dialog2Component,
    permitAll: true
  },
  {path: '', pathMatch: 'full', redirectTo: '/dialog1'}
];
```

Please note that in the above code we replaced the type `Routes` with the `AuthorizedRoutes` imported from `@devon4ng/authorization`. In addition to `Routes`' properties, the `AuthorizedRoutes` type
provides:
- the `permitAll` property which, if set to `true`, makes a route public
- the `authorizeForRight` property which makes a route accessible only for users having the right set
- the `authorizeForRightsOf` property which makes a route accessible only for users having **all** the rights set

#### 4. Set the `AuthorizationGuard` on your routes:

In order for the router to protect your routes (according to the configuration provided above) you need to set the `AuthorizationGuard` on your routes. The easiest way to do it
is to make use of the `addAuthorizationGuards` function provided by the Authorization Module: 

```ts
import {DevonfwAuthorizationModule, addAuthorizationGuards} from '@devon4ng/authorization';

const routes = ...

@NgModule({
  imports: [
    ...
    RouterModule.forRoot(routes),
    DevonfwAuthorizationModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    addAuthorizationGuards(router);
  }
}
```

The `addAuthorizationGuards` function traverses the route configuration and sets the `AuthorizationGuard` on those routes having the `path` and `component` properties set.

If you need more control over on which routes the `AuthorizationGuard` is set, you can:
- pass a callback function to `addAuthorizationGuards` (as the 2nd argument):

```ts
// add guards to routes having paths and components provided, but having no children
addAuthorizationGuards(router, route => route.path != null && route.component && route.children == null);
```

- set the `AuthorizationGuard` manually, in which case we don't need `addAuthorizationGuards` anymore:

```ts
import {AuthorizedRoutes, AuthorizationGuard} from '@devon4ng/authorization';

enum Right {
  User, Admin
}

const routes: AuthorizedRoutes<Right> = [
  {
    path: 'dialog1',
    component: Dialog1Component,
    authorizeForRight: Right.User,
    canActivate: [AuthorizationGuard]
  },
  {
    path: 'dialog2',
    component: Dialog2Component,
    permitAll: true,
    canActivate: [AuthorizationGuard]
  },
  {path: '', pathMatch: 'full', redirectTo: '/dialog1'}
];
```

#### 4. Provide your `IsAuthorized` service:

The last puzzle is to provide a service which can be called by the Authorization Module to find out if the current user is authorized for given rights.
the Authorization Module only provides a dummy service authorizing for any rights requested. Let's implement our `AuthorizationService`:

```ts
import {IsAuthorized} from '@devon4ng/authorization';
import {Observable, of} from 'rxjs';

export class AuthorizationService implements IsAuthorized<Right> {
  private userRights = [Right.User];

  isAuthorizedForRightsOf(requiredRights: Right[]): Observable<boolean> {
    if (requiredRights && requiredRights.length > 0) {
      return of(this.userHasAllRightsOf(requiredRights));
    }
    return of(true); // if no rights required
  }

  private userHasAllRightsOf(requiredRights: Right[]) {
    return requiredRights.reduce(
      (isAuthorized, requiredRight) => isAuthorized ? (this.userRights ? this.userRights.includes(requiredRight) : false) : false,
      true);
  }
}
```

Let's provide the service above:

```ts
import {isAuthorizedInjectionToken} from '@devon4ng/authorization';

@NgModule({
  imports: [
    ...
    RouterModule.forRoot(routes),
    DevonfwAuthorizationModule.forRoot()
  ],
  provide: [{provide: isAuthorizedInjectionToken, useClass: AuthorizationService}]
  bootstrap: [AppComponent]
})
export class AppModule {}
```
