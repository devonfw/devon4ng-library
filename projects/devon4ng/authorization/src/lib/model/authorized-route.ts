import { Route } from '@angular/router';

export type AuthorizedRoutes<R> = AuthorizedRoute<R>[];

export interface AuthorizedRoute<R> extends Route {
  permitAll?: boolean;
  authorizeForRightsOf?: R[];
  authorizeForRight?: R;
  children?: AuthorizedRoutes<R>;
}
