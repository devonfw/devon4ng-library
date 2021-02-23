import { Route, Router } from '@angular/router';
import { AuthorizationGuard } from '../guard/authorization.guard';

export type ConfigAwareRouter = Pick<Router, 'config' | 'resetConfig'>;

export const addAuthorizationGuards = (router: ConfigAwareRouter, addGuardForRouteFn?: (route: Route) => boolean) => {
  const guardShouldBeAdded = addGuardForRouteFn || ((route: Route) => route.path != null && route.component);

  if (router.config) {
    traverseTree<Route>({ children: router.config }, (route) => {
      if (guardShouldBeAdded(route)) {
        route.canActivate = route.canActivate || [];
        route.canActivate.push(AuthorizationGuard);
      }
    });

    router.resetConfig(router.config);
  }
};

interface TreeElement {
  children?: TreeElement[];
}

const traverseTree = <E extends TreeElement>(treeRoot: E, onTreeElementVisitFn: (element: E) => void) => {
  const stack = [];
  let currentElement = treeRoot;

  while (currentElement) {
    onTreeElementVisitFn(currentElement);
    if (currentElement.children) {
      Array.prototype.push.apply(stack, currentElement.children); // push all children (as an array) on stack
    }
    currentElement = stack.pop();
  }
};
