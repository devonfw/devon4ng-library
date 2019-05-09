# Authorization Module

This `devon4ng` Angular module adds rights-based authorization to your Angular app. Eager to see how it works? Go to a [Stackblitz demo](https://stackblitz.com/github/mmatczak/devon4ng-authorization-demo).

## Installation

```bash
$ npm install @devon4ng/authorization --save
```

Or you can use **yarn:**

```bash
$ yarn add @devon4ng/authorization
```

## Usage

This`devon4ng` Authorization Module mainly focuses on protecting your routes so that they can only be accessed by authorized users (having specific rights).

#### 1. Configure the router

The starting point when setting up this `devon4ng` Authorization Module is Angular router with routes configured. So let's configure the router first - if you haven't done it yet :), e.g.:

```ts
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Dialog1Component} from './components/dialog1.component';
import {Dialog2Component} from './components/dialog2.component';
import {Dialog3Component} from './components/dialog3.component';

const routes: Routes = [
  {
    path: 'dialog1',
    component: Dialog1Component
  },
  {
    path: 'dialog2',
    component: Dialog2Component
  },
  {
    path: 'dialog3',
    component: Dialog3Component
  },
  {path: '', pathMatch: 'full', redirectTo: '/dialog1'}
];

@NgModule({
  declarations: [
    AppComponent,
    Dialog1Component,
    Dialog2Component,
    Dialog3Component
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
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

#### 3. Configure rights needed to access your routes:

```ts
import {AuthorizedRoutes} from '@devon4ng/authorization';

enum Right {
  User, Admin
}

const routes: AuthorizedRoutes<Right> = [
  {
    path: 'dialog1',
    component: Dialog1Component,
    permitAll: true
  },
  {
    path: 'dialog2',
    component: Dialog2Component,
    authorizeForRight: Right.User
  },
  {
    path: 'dialog3',
    component: Dialog3Component,
    authorizeForRight: Right.Admin
  },
  {path: '', pathMatch: 'full', redirectTo: '/dialog1'}
];
```

Please note that in the above code we replaced the type `Routes` with the `AuthorizedRoutes` imported from `@devon4ng/authorization`. In addition to `Routes`' properties, the `AuthorizedRoutes` type
provides:
- the `permitAll` property which, if set to `true`, makes a route public
- the `authorizeForRight` property which makes a route accessible only for users having the right provided as value
- the `authorizeForRightsOf` property which makes a route accessible only for users having **all** the rights provided as an array

#### 4. Set the `AuthorizationGuard` on your routes:

In order for the router to protect your routes (according to the configuration provided above) you need to set the `AuthorizationGuard` on your routes (more on router guards [here](https://angular.io/guide/router#milestone-5-route-guards)). The easiest way to do it
is to make use of the `addAuthorizationGuards` function provided by the `DevonfwAuthorizationModule`: 

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

- set the `AuthorizationGuard` manually, in which case you don't need `addAuthorizationGuards` anymore:

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

The last piece of the puzzle is to provide a service which can be called by the `AuthorizationGuard` to find out if the current user is authorized for given rights.
The `DevonfwAuthorizationModule` only provides a dummy service authorizing for any rights requested (`AuthorizedForAnyRight`).

Let's implement our simple `AuthorizationService`:

```ts
import {IsAuthorized} from '@devon4ng/authorization';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';

// moved here from the AppModule to avoid a circular dependency
export enum Right {
  User, Admin
}

@Injectable()
export class AuthorizationService implements IsAuthorized<Right> {
  private userRights = [Right.User]; // get the actual rights from your (authorization) server

  isAuthorizedForRightsOf(requiredRights: Right[]): Observable<boolean> {
    if (requiredRights && requiredRights.length > 0) {
      return of(this.userHasAllRightsOf(requiredRights));
    }
    return of(true); // when no required rights...
  }

  private userHasAllRightsOf(requiredRights: Right[]) {
    return requiredRights.reduce(
      (isAuthorized, requiredRight) => (
        isAuthorized ? (this.userRights ? this.userRights.includes(requiredRight) : false) : false),
      true);
  }
}
```

Please note that in real-life scenarios you would request the user rights from your server and cache them for the lifetime of your user session.

Now let's replace the `DevonfwAuthorizationModule`'s dummy implementation with the one implemented above:

```ts
import {isAuthorizedInjectionToken} from '@devon4ng/authorization';

@NgModule({
  imports: [
    ...
    RouterModule.forRoot(routes),
    DevonfwAuthorizationModule.forRoot()
  ],
  providers: [{provide: isAuthorizedInjectionToken, useClass: AuthorizationService}]
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 5. Enjoy :)

Now you can try it out! Assuming the `DevonfwAuthorizationModule` was set up like described above you should be able to access
both `/dialog1` (because it is configured as a public route) and `/dialog2` (because in the `AuthorizationService` we set user rights to `Right.User`).
Access to `/dialog3` will be denied: you will stay at the current route. This is not all about user friendliness :) To change this behavior you can configure the `DevonfwAuthorizationModule`
to navigate to some route when the authorization check fails:

```ts
import {DevonfwAuthorizationModule, addAuthorizationGuards} from '@devon4ng/authorization';

const routes: AuthorizedRoutes<Right> = [
  ...
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    permitAll: true
  }
];

@NgModule({
  imports: [
    ...
    RouterModule.forRoot(routes),
    DevonfwAuthorizationModule.forRoot({urlOnAuthorizationFailure: '/access-denied'})
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  ...
}
```

The fully working demo is available on [Github](https://github.com/mmatczak/devon4ng-authorization-demo) and [Stackblitz](https://stackblitz.com/github/mmatczak/devon4ng-authorization-demo).
