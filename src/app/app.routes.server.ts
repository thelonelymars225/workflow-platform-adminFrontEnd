import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  { path: 'atlas/tasks/:id/**', renderMode: RenderMode.Server },
  { path: 'jobs/:id/**', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
