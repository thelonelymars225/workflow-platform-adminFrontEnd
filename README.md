# workFlow frontend — Atlas v2

Angular 21 implementation of [Atlas v2 in Figma](https://www.figma.com/design/c7j7GsdR0CgqhNJjM9YyYl?node-id=43-453). The familiar sidebar, three use cases, guided setup/review flow, connected apps, people, and settings follow the refined Atlas design, with responsive layouts and native form controls.

## Run

Use Node 24 LTS and npm 11. Dependencies are unchanged and locked.

```sh
npm ci
npm start
```

Open `http://localhost:4200`. The default `/start` route opens the clearly labeled **Atlas preview**. It works without a backend. `/sign-in` presents the sign-in design, with a direct link to explore the sample workspace.

## What is connected

| Area               | Behavior                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/workflows`       | Existing real workflow API: health, list, and create. Input retention, request errors, pending-submit protection, and HTTP tests are preserved.               |
| `/start`, `/tasks` | Interactive sample workspace. Create tasks, edit setup, filter tasks, save drafts, review, and try completion.                                                |
| `/connections`     | Sample access details and a local connection preview. No OAuth or provider requests.                                                                          |
| `/people`          | Sample members, role explanations, and invitation previews. No invitations are sent.                                                                          |
| `/settings`        | Workspace name, profile, timezone, and reminder preferences saved in this browser for the preview.                                                            |
| `/sign-in`         | Sign-in UI and explanatory dialog. No authentication, account creation, session, or route protection is simulated. The email is neither submitted nor stored. |

The backend currently exposes workflow definition CRUD, not SSO, app connections, document processing, scheduling, delivery, workspace administration, or approval execution. These Atlas areas are explicitly marked as previews. Sample report/update content is fixed; choosing a file name does not read or analyze a real file. The completion view states that nothing was sent. This PR does not add backend endpoints or security enforcement.

Preview changes are stored under `workflow.atlas-preview.v1` in localStorage after hydration. Malformed/version-mismatched data falls back to the samples. Storage failures show a notice and retain changes for the current visit. Use sample information only; preview storage is not a credentials store. Clear that localStorage key to reset the sample workspace. `/workflows` uses the existing server API and does not mix its records with preview tasks.

## API and SSR

Start PostgreSQL and the [.NET backend](https://github.com/thelonelymars225/workflow-platform), following that repository's README, then run:

```sh
dotnet run --project services/Workflow.Api --launch-profile http
```

`src/app/workflow-api.ts` remains the typed HttpClient boundary using same-origin `/api`. The single development API address is in `proxy.conf.json` (default `http://localhost:5159`). Restart `npm start` after changing it. No credentials belong in frontend code or the proxy configuration.

Requests and localStorage restoration run only after hydration. The production build prerenders eight static routes; task IDs use server rendering and hydrate to browser-local drafts. Production hosting needs the Angular SSR server for dynamic/deep links and same-origin `/api` routing; the standalone SSR server does not use the development proxy. API liveness does not imply PostgreSQL readiness.

## Code map

- `src/app/layout/`: responsive sidebar, mobile menu, skip link, help, and router outlet.
- `src/app/features/`: home, tasks (setup/review/completion/list), connections, people, settings, sign-in, and the preserved API workflow screen.
- `src/app/preview/`: typed sample data and isolated browser persistence. This is never an authentication or authorization boundary.
- `src/app/shared/`: page heading, native modal dialog, and not-found view.
- `src/theme.css`: Tailwind v4 theme tokens taken from the existing Atlas design.
- `src/styles.css`: shared controls, cards, rows, responsive grids, focus states, and reduced-motion handling.
- `public/atlas/`: exact exported Figma icons and a self-hosted DM Sans font with its license.

Native dialog elements provide focus containment, Escape dismissal, and focus restoration. Navigation uses real URLs and active states; filters expose pressed state; forms have labels and validation messages. Mobile uses a labeled expandable menu and stacked forms/cards. No new runtime dependencies were added.

## Styling

Tailwind v4 uses the CSS `@theme` configuration in `src/theme.css` (no JavaScript config is needed). Change design values there: semantic colors (`canvas`, `surface`, `ink`, `accent`, `border`), control/panel radii, shadows, typography, and container sizes. The tokens generate utilities such as `bg-surface`, `text-accent`, and `max-w-workspace` and are also available as CSS variables.

Reuse `.button` / `.button.secondary`, `.field` for inset inputs and native dropdowns, `.control` for outlined controls, `.panel` for containers, and the existing grid/row patterns. These live in Tailwind's components layer so utilities can handle page-specific spacing without duplicating the component. Component styles use `@reference` to access the same theme without importing another copy of the global stylesheet. Keep the current responsive breakpoints and native control behavior; this theme does not introduce another visual design.

## Checks

```sh
npm test -- --watch=false
npm run build
```

Tests cover the existing HTTP contract, request failures/input retention, routed task setup and review, edited-value retention, the completion gate, missing tasks, local persistence restoration, corrupt state, storage failures, and duplicate invitation previews.

For browser review, check desktop at 1440×960 and mobile at 390×844:

1. Start each use case, change its fields, open the preview, and use **Make changes**. Confirm the edited values remain.
2. Save a draft, refresh, and open it from **My tasks → Saved drafts**.
3. Try report completion, weekly-update confirmation, and approval-request confirmation. Confirm preview labels remain clear and no delivery is implied.
4. Use Connected apps access dialogs; preview a connection. Try an invalid and then valid invitation, and confirm member counts update without sending email.
5. Save workspace/profile preferences and refresh. Open each settings section and the sign-in explanation.
6. Use Tab, Shift+Tab, Enter, and Escape to check the menu, links, form controls, modal focus, and focus return. Check narrow layout and 200% zoom for overflow.
7. With the API/database running, use `/workflows` to create a definition, refresh, and restart the API to check persistence. Stop the API to check errors and retained input.

Automated unit tests and production build have passed. The cloud browser could not reach localhost in the implementation environment, so visual/browser checks and live PostgreSQL persistence remain manual verification items. Do not treat the mocked HTTP tests as a live backend integration test.
