import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const isAuthorizedInjectionToken = new InjectionToken<IsAuthorized<any>>('is-authorized');

export interface IsAuthorized<R> {
  isAuthorizedForRightsOf(rights: R[]): Observable<boolean>;
}
