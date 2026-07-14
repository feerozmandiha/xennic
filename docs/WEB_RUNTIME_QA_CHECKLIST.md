# Web Runtime QA Checklist

## Purpose

This checklist defines the manual runtime QA baseline for the Xennic Web application.

Use it before major releases, after large UI changes, after authentication or routing changes, and after build/deployment pipeline changes.

The goal is to verify that the main user-facing flows are usable in a real browser, beyond lint, typecheck, unit tests, E2E API tests, and production build checks.

## Preconditions

Before running this checklist, verify the automated baseline first.

- [ ] Git working tree is clean.
- [ ] API lint passes.
- [ ] Web lint passes.
- [ ] API typecheck passes.
- [ ] Web typecheck passes.
- [ ] API full E2E passes.
- [ ] Web production build passes.
- [ ] CI is green.
- [ ] Release Gate is green.

Recommended commands:

- `git status --short --branch`
- `corepack pnpm --filter @xennic/api lint`
- `corepack pnpm --filter @xennic/web lint`
- `corepack pnpm --filter @xennic/api typecheck`
- `corepack pnpm --filter @xennic/web typecheck`
- `corepack pnpm --dir apps/api exec jest --config test/jest-e2e.json --runInBand --detectOpenHandles`
- `corepack pnpm --filter @xennic/web build`

## Test Environment

Record the environment before testing.

| Item                    | Value    |
| ----------------------- | -------- |
| Date                    |          |
| Tester                  |          |
| Branch                  |          |
| Commit SHA              |          |
| Browser                 |          |
| Browser version         |          |
| OS                      |          |
| API base URL            |          |
| Web URL                 |          |
| Locale tested           |          |
| Test account            |          |
| Admin account available | Yes / No |

## Startup Smoke Test

- [ ] API starts successfully.
- [ ] Web app starts successfully.
- [ ] Browser can open the Web URL.
- [ ] No fatal browser console errors on initial load.
- [ ] No repeated network failures in browser DevTools.
- [ ] API health or base endpoint responds as expected.
- [ ] Local environment variables are loaded as expected.
- [ ] No private keys or secrets are exposed in browser output.

## Public Landing Flow

Route examples:

- `/:locale`
- `/fa`
- `/en`

Checklist:

- [ ] Landing page loads without runtime errors.
- [ ] Header and navigation render correctly.
- [ ] CTA buttons are visible and clickable.
- [ ] Language switcher works.
- [ ] Theme toggle works.
- [ ] Guest calculation section renders.
- [ ] Articles section renders or fallback content appears.
- [ ] Pricing section renders.
- [ ] Footer renders.
- [ ] Page remains usable on mobile viewport.
- [ ] No duplicate landing route behavior is observed.

## Public Pages

Routes:

- `/:locale/about`
- `/:locale/contact`
- `/:locale/knowledge`
- `/:locale/knowledge/:id` when public content is available
- `/:locale/public/calculations/sample/cable-sizing`
- `/:locale/public/calculations/sample/transformer-load`

Checklist:

- [ ] About page loads.
- [ ] Contact page loads.
- [ ] Contact form UI behaves correctly.
- [ ] Public knowledge list loads.
- [ ] Public knowledge detail loads when an item exists.
- [ ] Public calculation sample pages load.
- [ ] Empty or missing data states are user-friendly.
- [ ] No unexpected authentication redirect occurs on public pages.

## Authentication Flow

Routes:

- `/:locale/login`
- `/:locale/register`
- `/:locale/forgot-password`

Checklist:

- [ ] Login page loads.
- [ ] Register page loads.
- [ ] Forgot password page loads.
- [ ] Form validation messages are visible and understandable.
- [ ] Invalid login shows a safe error message.
- [ ] Successful login redirects to the expected authenticated area.
- [ ] Logout clears session state.
- [ ] Authenticated user is not incorrectly sent back to login.
- [ ] Guest user is redirected from protected pages when required.

## Workspace Flow

Routes:

- `/:locale/workspace`
- `/:locale/workspaces/new`
- `/:locale/dashboard`

Checklist:

- [ ] Workspace welcome page handles no-workspace state.
- [ ] New workspace page loads.
- [ ] Workspace selector renders in authenticated layout.
- [ ] Dashboard loads after selecting or creating a workspace.
- [ ] Workspace-specific data does not leak across workspace changes.
- [ ] Empty states are clear and not broken.
- [ ] Loading states are visible and do not hang indefinitely.

## Dashboard Flow

Route:

- `/:locale/dashboard`

Checklist:

- [ ] Dashboard page loads.
- [ ] Summary cards render.
- [ ] Recent projects section renders.
- [ ] Recent calculations section renders.
- [ ] Subscription usage section renders.
- [ ] Navigation links from dashboard work.
- [ ] No critical console errors are present.

## Engineering Calculations Flow

Routes:

- `/:locale/engineering`
- `/:locale/power-system`
- `/:locale/energy`

Checklist:

- [ ] Engineering page loads.
- [ ] Calculation catalog renders.
- [ ] Guest-accessible calculations are usable when unauthenticated.
- [ ] Authenticated calculations run successfully for valid inputs.
- [ ] Invalid inputs show validation feedback.
- [ ] Result panel renders after calculation.
- [ ] PDF/report actions do not break the page.
- [ ] AI review action handles loading, success, and failure states.
- [ ] Suggested products section handles empty or unavailable data.
- [ ] Power system page loads.
- [ ] Energy bill analyzer page loads.
- [ ] Long calculation forms remain usable on mobile.

## AI Chat Flow

Route:

- `/:locale/ai`

Checklist:

- [ ] AI chat page loads.
- [ ] Conversation list renders or empty state appears.
- [ ] New message input is usable.
- [ ] Sending a message shows loading or streaming state.
- [ ] Response content renders safely.
- [ ] Markdown-like content does not break the layout.
- [ ] Copy action works when available.
- [ ] Error state is user-friendly if provider/API is unavailable.

## Knowledge Flow

Routes:

- `/:locale/knowledge`
- `/:locale/knowledge/:id`
- `/:locale/knowledge-manage`
- `/:locale/knowledge-manage/new`
- `/:locale/knowledge-manage/:id`
- `/:locale/knowledge-manage/:id/edit`

Checklist:

- [ ] Public knowledge list loads.
- [ ] Public knowledge detail loads.
- [ ] Knowledge management list loads for authorized users.
- [ ] New knowledge page loads.
- [ ] Knowledge editor loads without crashing.
- [ ] Rich text toolbar is usable.
- [ ] Math/formula rendering is stable.
- [ ] Taxonomy selector is usable.
- [ ] Draft, review, publish, archive, and restore actions behave as expected where permitted.
- [ ] Unauthorized users cannot access management actions.

## Projects Flow

Routes:

- `/:locale/projects`
- `/:locale/projects/:id`

Checklist:

- [ ] Projects list loads.
- [ ] Empty state is clear.
- [ ] Project detail loads.
- [ ] Notes section works where available.
- [ ] Members section works where available.
- [ ] Project actions respect permissions.
- [ ] Deleted or missing project states are handled gracefully.

## Billing and Subscription Flow

Routes:

- `/:locale/billing`
- `/:locale/billing/checkout`
- `/:locale/settings?tab=plan`

Checklist:

- [ ] Billing page loads.
- [ ] Current plan is displayed.
- [ ] Usage counters render.
- [ ] Invoices tab renders.
- [ ] Payments tab renders.
- [ ] Checkout page loads for a valid plan.
- [ ] Invalid or missing plan state is handled.
- [ ] Payment failure state is user-friendly.
- [ ] Payment success callback state is user-friendly.
- [ ] Admin/full-access state is clearly indicated when applicable.

## Marketplace Flow

Routes:

- `/:locale/marketplace`
- `/:locale/marketplace/orders`
- `/:locale/marketplace/products/:id`
- `/:locale/marketplace/products/new`

Checklist:

- [ ] Marketplace page loads.
- [ ] Products tab renders.
- [ ] Orders tab renders.
- [ ] Vendors tab renders when available.
- [ ] Product detail page loads.
- [ ] Product creation page loads for authorized users.
- [ ] Empty states are clear.
- [ ] Unauthorized actions are blocked.

## Storage and Vision Flow

Routes:

- `/:locale/storage`
- `/:locale/vision`

Checklist:

- [ ] Storage page loads.
- [ ] Upload UI renders.
- [ ] File list or empty state renders.
- [ ] Vision page loads.
- [ ] Vision upload/input area renders.
- [ ] API unavailable state is handled without crashing.
- [ ] Large files are rejected or handled safely.

## Search and Notifications Flow

Routes:

- `/:locale/search`
- `/:locale/notifications`

Checklist:

- [ ] Search page loads.
- [ ] Search input focuses correctly.
- [ ] Search can run for a valid query.
- [ ] Empty results state is clear.
- [ ] Filters can be toggled.
- [ ] Pagination works when available.
- [ ] Notifications page loads.
- [ ] Mark-as-read action works where available.
- [ ] Delete action works where available.
- [ ] Empty notifications state is clear.

## Settings Flow

Route:

- `/:locale/settings`

Checklist:

- [ ] Settings page loads.
- [ ] Profile tab renders.
- [ ] Workspace tab renders.
- [ ] Security tab renders.
- [ ] Plan tab renders.
- [ ] Appearance tab renders.
- [ ] Theme settings work.
- [ ] Language/locale behavior remains consistent.
- [ ] Save actions show success or error feedback.
- [ ] Sensitive fields are not exposed.

## Admin Flow

Route:

- `/:locale/admin`

Run this section only with an admin account.

Checklist:

- [ ] Admin page loads for admin user.
- [ ] Non-admin users are denied or redirected.
- [ ] Dashboard section renders.
- [ ] Users section renders.
- [ ] Workspaces section renders.
- [ ] Plans section renders.
- [ ] Consultations section renders.
- [ ] Taxonomy section renders.
- [ ] API keys, webhooks, and feature flags sections render where available.
- [ ] Destructive actions require confirmation or are clearly indicated.

## Responsive Layout

Viewports:

- Mobile width
- Tablet width
- Desktop width

Checklist:

- [ ] Navigation remains usable on mobile.
- [ ] Sidebar/dashboard layout remains usable.
- [ ] Tables are scrollable or responsive.
- [ ] Long engineering forms are usable.
- [ ] Modals fit the viewport.
- [ ] Dropdowns and popovers are not clipped.
- [ ] RTL layout is correct for Persian.
- [ ] LTR layout is correct for English.

## Accessibility and UX Smoke Checks

Checklist:

- [ ] Main interactive controls are keyboard reachable.
- [ ] Focus states are visible.
- [ ] Buttons have understandable labels.
- [ ] Loading states are visible.
- [ ] Empty states are understandable.
- [ ] Error messages do not expose sensitive internals.
- [ ] Color contrast is acceptable for primary actions.
- [ ] No obvious layout shift breaks the main flow.

## Browser Console and Network Checks

Checklist:

- [ ] No uncaught runtime exceptions in console.
- [ ] No hydration mismatch loops.
- [ ] No repeated failed requests after page becomes idle.
- [ ] 401 and 403 responses occur only where expected.
- [ ] 500 responses are investigated.
- [ ] Static assets load successfully.
- [ ] Fonts load or fallback gracefully.

## Release Sign-off

| Item                        | Status |
| --------------------------- | ------ |
| Public routes checked       |        |
| Auth routes checked         |        |
| Dashboard checked           |        |
| Engineering checked         |        |
| Knowledge checked           |        |
| Billing checked             |        |
| Marketplace checked         |        |
| Admin checked if applicable |        |
| Mobile viewport checked     |        |
| Browser console reviewed    |        |
| Network errors reviewed     |        |
| Tester sign-off             |        |

## Notes

Use this section for observations, issues, and follow-up tasks.

-
