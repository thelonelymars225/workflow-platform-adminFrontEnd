# Workflow admin frontend

Minimal Angular list/create screen backed by the [Workflow .NET API](https://github.com/thelonelymars225/workflow-platform). This is a local development slice, not a production deployment.

## Run locally

Use Node 24 LTS and npm 11 (checked with Node 24.19.0 / npm 11.9.0). Dependencies are locked; Angular/CLI are 21.2.x. The backend requires .NET 10 and a running PostgreSQL 16+ development database. Follow its README to configure `ConnectionStrings:WorkflowDatabase`, run the initial EF migration, and optionally enable the development seed.

Start the API in the backend repository:

```sh
dotnet run --project services/Workflow.Api --launch-profile http
```

Then from this frontend repository:

```sh
npm ci
npm start
```

Open `http://localhost:4200`. API liveness is `http://localhost:5159/health`; Development OpenAPI is `http://localhost:5159/openapi/v1.json`. The UI's API-connected label reports liveness, not database readiness; list errors separately show database/API failures.

## API wiring and SSR

`src/app/workflow-api.ts` is the typed HttpClient boundary for health/list/get/create and uses same-origin `/api`. **The only development backend address is in `proxy.conf.json`** (default `http://localhost:5159`); restart `npm start` after changing it. Angular's dev server forwards `/api/**`, so no permissive CORS is needed. Do not put database credentials in Angular code or proxy configuration.

`app.config.ts` provides HttpClient with fetch. `afterNextRender` in `app.ts` starts requests only in the hydrated browser; SSR/prerender renders a stable loading shell without attempting a relative-URL server fetch. `npm run build` checks browser and server bundles. The standalone generated SSR server does **not** use the development proxy: a production host would need same-origin `/api` routing. Production routing/deployment is outside this setup.

## Checks and smoke test

```sh
npm test -- --watch=false
npm run build
```

Unit tests use Angular's HTTP test backend, not a real API/database. They cover loading/empty state, whitespace validation, pending duplicate prevention, list reload after create, and failure/input retention.

For the real integration smoke test, use PostgreSQL plus the API, then:

1. Check loading followed by an empty list on a fresh database with seed off.
2. Create a workflow with an optional description; confirm it appears with a saved ID.
3. Refresh the page, restart the API, and refresh again: the same saved ID must remain.
4. Submit only spaces; expect validation without a request. API-side direct invalid POST must also return 400.
5. Stop the API and retry list/create; expect visible errors and retained inputs. Repeat with PostgreSQL unavailable; API liveness may still succeed while the list fails.

Successful browser creation, reload/API-restart persistence, and real PostgreSQL migration/seed checks were not verified in the restricted setup environment because no usable PostgreSQL instance was available. Do not treat passing mocked unit tests as those integration checks.

## Code map and troubleshooting

- `src/app/workflow-api.ts`: DTOs and all API calls.
- `src/app/app.ts`, `app.html`, `app.css`: loading, empty, error and success states; list/create UI; pending submission lock.
- `src/app/app.config.ts`: application providers and hydration.
- `src/app/app.spec.ts`: HTTP-isolated component tests.
- `proxy.conf.json` and `angular.json`: local API proxy and dev-server configuration.

Connection errors: verify `/health` directly, API port 5159, and proxy target, then restart the dev server. An API-connected badge plus failed list usually means database configuration, PostgreSQL, or migrations need attention; see the backend README. Use the HTTP launch profile to avoid development certificate issues. If port 4200 is occupied, stop the earlier server or use `npm start -- --port 4201`. There is no e2e runner installed; use the explicit real-browser checklist above.
