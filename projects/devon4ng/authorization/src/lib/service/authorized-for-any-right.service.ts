import { Observable, of } from 'rxjs';
import { IsAuthorized } from '../model/is-authorized';

export class AuthorizedForAnyRight implements IsAuthorized<any> {
  isAuthorizedForRightsOf(rights: any[]): Observable<boolean> {
    return of(true);
  }
}
