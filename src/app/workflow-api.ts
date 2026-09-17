import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflow {
  name: string;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkflowApi {
  private readonly http = inject(HttpClient);
  // Same-origin in the browser. The one development API address is in proxy.conf.json.
  private readonly baseUrl = '/api';

  health() { return this.http.get<{ status: string }>(`${this.baseUrl}/health`); }
  list() { return this.http.get<Workflow[]>(`${this.baseUrl}/workflows`); }
  get(id: string) { return this.http.get<Workflow>(`${this.baseUrl}/workflows/${encodeURIComponent(id)}`); }
  create(request: CreateWorkflow) { return this.http.post<Workflow>(`${this.baseUrl}/workflows`, request); }
}
