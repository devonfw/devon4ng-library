import { HttpResponse } from '@angular/common/http';

export interface CacheEntry {
  url: string;
  method: string;
  body: object;
  response?: HttpResponse<any>;
  entryTime?: number;
}
