import { HttpResponse } from '@angular/common/http';

export interface CacheEntry {
  url: string;
  method: string;
  body: Record<string, unknown>;
  response?: HttpResponse<any>;
  entryTime?: number;
}
