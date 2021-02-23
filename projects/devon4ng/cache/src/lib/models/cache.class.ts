import { HttpRequest, HttpResponse } from '@angular/common/http';

export abstract class Cache {
  cacheMap: Map<string, any>;
  abstract get(key: string): HttpResponse<any> | null;
  abstract put(req: HttpRequest<any>, res: HttpResponse<any>): void;
}
