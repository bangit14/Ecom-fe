# Admin UI Migration

## Scope and guardrails

- Scope: presentation layer for the Admin portal only.
- Preserve: routes, route guards, authorization, props, local state, hooks, API calls, file names, and existing services.
- Visual direction: utilitarian minimalism for dense operational work. Flat surfaces, light dividers, restrained semantic color, no gradients, and minimal motion.
- Migration cadence: implement at most three checked items per approved batch, then stop for review.
- Current UI foundation: `ecommerce-frontend/src/styles/theme.css`, `ecommerce-frontend/src/styles/theme.js`, and `ecommerce-frontend/src/components/ui/`. The legacy `theme.ts` file is retained and no new TypeScript files are introduced.

## Current UI stack

| Area | Current choice | Notes |
|---|---|---|
| Runtime | React 19.2 + React DOM 19.2 | Vite single-page application. |
| Language | JavaScript / JSX | `theme.ts` exists, but no TypeScript compiler or `tsconfig.json` is present. |
| Styling | Tailwind CSS 3.4 + CSS variables | Token CSS is loaded from `src/styles/theme.css`. |
| UI primitives | Local `src/components/ui/` + Headless UI 2.2 | Local primitives include Button, Input, Table, Modal, Drawer, Tabs, Toast, Skeleton, EmptyState, and Pagination. |
| Icons | `lucide-react` and `@heroicons/react` | Existing project uses both families. No icon migration in this scope. |
| Async data | TanStack React Query 5 + Axios | Existing data layer remains unchanged. |
| Feedback | `react-hot-toast` | Existing global toaster remains the active notification system. |
| Routing | React Router DOM 6 | Admin guard and route paths remain unchanged. |

## Admin route checklist

| Status | Route | Page file | Notes for UI migration |
|---|---|---|---|
| [ ] | `/admin/login` | `ecommerce-frontend/src/pages/auth/AdminLogin.jsx` | Admin authentication entry. |
| [x] | Admin shell | `ecommerce-frontend/src/layouts/AdminLayout.jsx` | Sidebar, topbar, breadcrumb, permission-aware navigation. |
| [x] | `/admin` | `ecommerce-frontend/src/pages/admin/Dashboard.jsx` | Operational overview and reporting entry. |
| [x] | `/admin/users` | `ecommerce-frontend/src/pages/admin/UsersManagement.jsx` | User list, filters, create/edit dialogs, pagination. |
| [ ] | `/admin/shops` | `ecommerce-frontend/src/pages/admin/ShopsManagement.jsx` | Seller approval and shop review. |
| [ ] | `/admin/categories` | `ecommerce-frontend/src/pages/admin/CategoryManagement.jsx` | Category tree, attributes, editor dialogs. |
| [ ] | `/admin/moderation` | `ecommerce-frontend/src/pages/admin/ContentModeration.jsx` | Product and review moderation queue. |
| [ ] | `/admin/campaigns` | `ecommerce-frontend/src/pages/admin/CampaignManagement.jsx` | Platform campaigns and vouchers. |
| [ ] | `/admin/disputes` | `ecommerce-frontend/src/pages/admin/DisputeManagement.jsx` | Dispute review and resolution queue. |
| [ ] | `/admin/tickets` | `ecommerce-frontend/src/pages/admin/TicketManagement.jsx` | Customer support ticket queue. |
| [ ] | `/admin/finance` | `ecommerce-frontend/src/pages/admin/PlatformFinance.jsx` | Platform finance and reconciliation. |
| [ ] | `/admin/shipping` | `ecommerce-frontend/src/pages/admin/PlatformShipping.jsx` | Platform shipping configuration. |
| [ ] | `/admin/roles` | `ecommerce-frontend/src/pages/admin/RolesManagement.jsx` | Staff RBAC management. |
| [ ] | `/admin/products` | `ecommerce-frontend/src/pages/admin/ProductManagement.jsx` | Legacy-compatible product administration route. |
| [ ] | `/admin/orders` | `ecommerce-frontend/src/pages/admin/OrderManagement.jsx` | Order operations, status actions, and detail views. |
| [ ] | `/admin/profile` | `ecommerce-frontend/src/pages/account/ProfilePage.jsx` | Shared account profile page within the Admin shell. |
| [ ] | `/admin/change-password` | `ecommerce-frontend/src/pages/account/ChangePasswordPage.jsx` | Shared account security page within the Admin shell. |

## Repeated UI to keep documented, not merge yet

| Repeated presentation | Found in | Migration decision |
|---|---|---|
| Table toolbar, filter controls, pagination, row actions | Users, Products, Orders, Categories, Shops, Tickets | Document and restyle per page first. Do not extract or merge behavior yet. |
| Create/edit modal shells and form field layouts | Users, Categories, Products, Orders | Reuse existing `components/ui/Modal` presentation only where props/state stay intact. |
| Status badges | Users, Products, Orders, Shops, Moderation, Disputes | Map visual variants to existing status values. Do not alter status logic. |
| KPI and summary cards | Dashboard, Finance, Shipping, Campaigns | Align density and hierarchy per page; no data aggregation changes. |
| Tabs and segmented filters | Products, Orders, Moderation, Campaigns | Keep current state ownership. Do not consolidate handlers. |

## Library decisions

Bundle figures are planning estimates for production gzip and must be verified after approval with the actual lockfile and build output.

| Library | Use | Candidate pages | Estimated added size | Conflict / recommendation |
|---|---|---|---|---|
| `@tanstack/react-table` | Headless sorting, filtering, pagination, row selection for dense tables | Users, Products, Orders, Shops, Categories, Tickets | About 15-20 KB | Installed for upcoming table migrations. Existing Users state/API remains unchanged in batch one. |
| `recharts` | Accessible operational charts | Dashboard, PlatformFinance, CampaignManagement | About 90-120 KB | Installed and used by Dashboard. Avoid loading it on table-only routes. |
| `react-hook-form` + `zod` | Form presentation and validation ergonomics | Users, Categories, Products, Shipping, Roles | About 25-35 KB combined | Defer. Existing form state must remain unchanged under the hard constraints, so do not adopt without explicit approval to preserve behavior. |
| `cmdk` | Keyboard command palette | AdminLayout, Dashboard | About 8-12 KB | Defer. Useful for power users, but not required for the first migration batch. |
| `react-day-picker` + `date-fns` | Date range filter UI | Orders, Finance, Campaigns, Dashboard | About 35-55 KB combined | Defer. Add only when existing date filter behavior is confirmed. |
| `sonner` | Toast notifications | All admin pages | About 5-8 KB | Do not install. It overlaps with existing `react-hot-toast`. |
| `shadcn/ui` + Radix | Generated component source and accessible primitives | Not proposed for this project | Varies by chosen primitives | Do not install. It would create a second component system alongside local `components/ui/` and Headless UI. |
| `@fontsource-variable/inter` | Self-hosted Inter font | All admin pages | About 200-700 KB depending on font assets | Do not install. The selected minimalist direction and current token foundation do not require Inter. |
| `lucide-react` | Icons | All admin pages | 0 KB added | Already installed. Reuse only where existing icon replacement is explicitly approved. |

## Proposed first implementation batch after approval

1. `AdminLayout.jsx`
2. `Dashboard.jsx`
3. `UsersManagement.jsx`

The batch prioritizes the always-visible shell, the administrator's entry page, and the highest-frequency operational table.

## Completed batch 1

| Status | Scope | Changes | Library use |
|---|---|---|---|
| [x] | `AdminLayout.jsx` | Retained route and role guards; compact desktop sidebar, mobile drawer, breadcrumb, permission-filtered navigation, and flat token-based topbar. | Local UI primitives and existing Headless UI Drawer. |
| [x] | `Dashboard.jsx` | Rebuilt as a dense operating overview with a KPI strip, priority queue, platform health panel, and responsive revenue chart. | `recharts`, local Card, Badge, Tabs. |
| [x] | `UsersManagement.jsx` | Rebuilt toolbar, table density, responsive filter drawer, create/edit modals, skeleton and empty states, focus/hover/disabled treatments. Existing CRUD, filter, sort, and pagination handlers remain intact. | Local Button, Input, Select, Drawer, Modal, Card, Badge, Skeleton, EmptyState. |

## Design foundation batch 2

Status: [x] created as an additive foundation. Existing pages and `SellerLayout.jsx` / `AdminLayout.jsx` were not replaced.

### Tokens and density

- Unified brand accent: teal tokens in `src/styles/theme.css` and the JavaScript mirror in `src/styles/theme.js`.
- Semantic tokens: neutral, success, warning, danger, and info with solid, soft, and readable ink values.
- Fixed typography: H1 32px, H2 24px, H3 20px, body 16px, small 14px, caption 12px.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.
- Radius scale: 6, 8, 12px. Shadow scale: small, medium, large.
- Density tokens: `comfortable` for buyer surfaces and `compact` for seller/admin surfaces.
- Tailwind aliases are defined in `tailwind.config.js`; existing hard-coded `Inter` and body background declarations were removed from `src/index.css`.

### UI components

All exports are available from `src/components/ui/index.js`.

| Component | Usage | Notes |
|---|---|---|
| `Button` | `variant`, `size`, `density`, `loading`, `leftIcon`, `rightIcon` | Disabled and loading states are built in. Icon-only usage must provide `aria-label`. |
| `Input` / `Select` / `Checkbox` | Controlled or uncontrolled form fields | Labels, hints, errors, disabled, focus, and invalid states are supported. |
| `Badge` | `neutral`, `primary`, `success`, `warning`, `danger`, `info` | Status color is semantic, not role-specific. |
| `Card` / `StatCard` | Surfaces and KPI summaries | `StatCard` includes loading and trend presentation. |
| `Tabs` | `items`, `value`, `defaultValue`, `onValueChange` | Supports tab roles and arrow-key movement. |
| `Modal` / `Drawer` | `open`, `onClose`, `title`, `description`, `footer` | Headless UI supplies Escape close, focus trap, focus restore, `role="dialog"`, and `aria-modal`. |
| `DataTable` | `columns`, `data`, `loading`, `error`, `onRetry` | Desktop table becomes a card/list view below 768px. `Table` remains a compatibility alias. |
| `FilterBar` | Wrap filter controls as children and action buttons through `actions` | Responsive filter layout with density support. |
| `Pagination` | `page`, `pageCount`, `onPageChange`, `density` | Keyboard-accessible buttons with disabled states. |
| `Skeleton` | Loading placeholders | Uses the shared motion and neutral tokens. |
| `EmptyState` / `ErrorState` | Empty and retryable error states | `ErrorState` accepts `onRetry` and keeps the retry action optional. |
| `Toast` | `ToastProvider` and `useToast` | Existing local toast API retained; `react-hot-toast` remains untouched. |
| `ProductCard` | Shared product presentation | Designed for Home, Products, Wishlist, recommendations, and ProductDetail-related suggestions. |

### Shared shell

`src/layouts/ShellLayout.jsx` is an additive shell for future Seller/Admin adoption. It accepts `brand`, `menuGroups`, `profile`, `roleLabel`, `headerActions`, `onLogout`, and optional `children`. It includes grouped navigation, desktop collapse, mobile Drawer, profile block, logout action, active route state, and responsive content spacing. Existing layouts remain unchanged until a page migration is approved.

### Library decision

No new package was installed in this batch. The foundation continues with Tailwind 3.4, CSS variables, local UI components, Headless UI, existing TanStack Table, Lucide icons, and the existing toast stack.

## Buyer redesign batch 1

Status: [x] `CustomerAccountHeader`, `CustomerAccountFooter`, `Home.jsx`, and `Products.jsx` updated. Existing routes, API services, filter state, URL synchronization, sorting, pagination, and mock product data remain in place. No new library was installed.

### Design reads used before implementation

- Header/Footer: mobile-first commerce navigation for repeat buyers, with a calm teal trust language, search as the primary action, and compact utility controls.
- Home: conversion-oriented storefront entry for phone users, with a focused hero, fast category discovery, shared product cards, and restrained promotional content.
- Products: scan-first product discovery, with compact filters, card-based mobile browsing, visible sort controls, and clear recovery states.

### Buyer changes

- Header is sticky, keeps `LanguageSwitcher`, exposes a prominent search field, preserves cart count badge, and moves compact navigation into the accessible local `Drawer` on mobile.
- Header and footer remove buyer-specific red/blue/gradient styling in favor of the shared teal, neutral, semantic, typography, radius, and shadow tokens.
- Home now uses `ProductCard`, shared `Skeleton`, `EmptyState`, and `ErrorState`; hero and newsletter actions keep real routes or the existing form behavior.
- Products keeps the existing API/filter/query behavior while using shared `ProductCard`, skeleton grid, inline empty/error retry states, responsive filter Drawer, compact sorting, and mobile-first spacing.
- `prefers-reduced-motion` is respected for category scrolling; global motion tokens and reduced-motion CSS remain active.

### Not changed yet

- `ProductDetail.jsx` remains untouched in this batch. Its requested component split is reserved for the next approved batch.
- `Cart.jsx` and `Checkout.jsx` remain untouched. `FOOTER_SECTIONS` cleanup and checkout-specific presentation are reserved for their batch.
- Optional libraries `motion`, `embla-carousel-react`, and `react-hook-form` were not installed. They require a separate approval before use.

## Buyer account redesign batch 1

Status: [x] `AccountLayout`, `AccountOrdersPage`, and `AccountWishlistPage` updated. Existing routes, props, state, hooks, services, and permissions remain unchanged. No new library was installed.

### Design reads and dials

- AccountLayout: desktop rail with clear active state; mobile becomes a horizontally scrollable account tab row.
- Orders: status-first tabs and scannable order cards; details open in an accessible dialog with a status timeline.
- Wishlist: shared `ProductCard` presentation with a focused remove action and a direct shopping CTA for empty state.
- Dials: variance 4, motion 3, density 4.

### Buyer account changes

- `AccountLayout.jsx` now uses the shared token language, responsive navigation, profile loading skeleton, and existing `CustomerAccountHeader` / `CustomerAccountFooter`.
- `AccountOrdersPage.jsx` now includes status tabs, responsive cards, loading skeletons, retryable error state, empty state, order detail timeline, and paginated detail items.
- `AccountWishlistPage.jsx` now uses the shared `ProductCard`, responsive product grid, loading skeletons, retryable error state, empty state, and pagination.
- `MyOrders.jsx` still exists but is not directly routed. The route was intentionally not changed; this audit note is recorded for future routing review.

### Not changed yet

- `Address`, `Notifications`, `Vouchers`, `Profile`, and `Change Password` remain for the next approved batch.

## Seller redesign batch 1

Status: [x] `SellerLayout`, `SellerDashboard`, and `SellerProducts` updated. Routes, seller guard, local mock data, state, and existing mutation handlers remain in place. No new library was installed.

### Design reads and dials

- SellerLayout: shared `ShellLayout` configured with seller menu groups, compact density, profile block, logout, notification action, desktop collapse, and mobile drawer.
- SellerDashboard: one prominent KPI row, then a prioritized “Việc cần làm hôm nay” queue; recent orders, product performance, and activity chart are visually quieter.
- SellerProducts: dense filter toolbar, shared `DataTable`, responsive mobile cards, semantic statuses, and quick edit in the shared accessible `Drawer`.
- Dials: variance 2, motion 1, density 7. Minimalist direction uses flat surfaces, dividers, restrained color, and no gradients.

### Component split

- `src/pages/seller/SellerProductFilters.jsx` owns only product tabs, search, counts, and selected bulk-action presentation.
- `src/pages/seller/SellerProductTable.jsx` owns only product table/card rendering and row actions passed from the page.
- The add/edit form remains in `SellerProducts.jsx` for this first slice, but is rendered through the shared `Drawer`; variant/upload extraction remains a later Product slice.

### Not changed yet

- `SellerOrders.jsx` and `SellerShipping.jsx` are reserved for the next batch.
- `admin/ProductManagement.jsx` (2,621 lines) is an admin route and was not changed in this seller batch; its staged extraction can be handled separately without altering seller routes.

## Admin redesign batch 2

Status: [x] `AdminLayout`, `Dashboard`, and `UsersManagement` updated. Existing role/permission filtering, routes, API services, pagination state, form state, and user CRUD calls remain intact. No new library was installed.

### Design reads and dials

- AdminLayout: shared `ShellLayout` with permission-filtered menu groups, compact desktop rail, mobile drawer, profile block, logout, notification action, and language switcher.
- Dashboard: KPI strip first, priority queue for pending shops/disputes/tickets before reporting, then a flat no-gradient chart and platform health summary.
- Users: unified `FilterBar`, compact `DataTable`, semantic dot badges, mobile cards, pagination, individual selection, bulk delete, and an accessible destructive-action confirmation modal.
- Dials: variance 2, motion 1, density 8. Minimalist direction uses flat surfaces, light dividers, restrained semantic color, and no heavy shadows.

### Not changed yet

- `OrderManagement.jsx` and `ProductManagement.jsx` remain for the next admin batch.
- `ProductManagement.jsx` remains separate from seller product structure. No component or route was merged between admin and seller.

## Seller redesign batch 2

Status: [x] `SellerMarketing`, `SellerFinance`, and `SellerAnalytics` updated. Existing local mock data, state, validation, toast actions, and withdrawal/voucher handlers remain in place. No new library was installed.

### Design reads and dials

- Marketing: compact tabs, flat voucher cards, semantic status badges, and shared accessible confirmation/create modals.
- Finance: clear balance hierarchy, compact reconciliation table, semantic money states, and shared withdrawal modal.
- Analytics: KPI strip, flat low-motion bar chart, and operational standards with compact progress bars.
- Dials: variance 2, motion 1, density 7. Existing tokens and UI components are reused; no new pattern system was introduced.

### Not changed yet

- `SellerCustomerCare.jsx` remains for the next batch; its fixed `h-[600px]` chat layout still needs the requested mobile two-screen flow.
- `SellerStaff.jsx` and `SellerSettings.jsx` remain for later seller batches.
- Remaining Admin pages and Auth pages remain queued.

## Cross-product presentation audit — redesign-existing-projects

Audit scope: all current `src/pages`, `src/layouts`, `src/components/ui`, auth, buyer, seller, and admin presentation files. Logic, API calls, route definitions, and permission behavior were not changed.

### Findings by priority

#### P0 — accessibility and interaction blockers

- Several legacy custom overlays still bypass the shared `Modal` / `Drawer` primitives and therefore need a11y remediation: `admin/CategoryManagement.jsx`, `admin/ProductManagement.jsx`, `admin/OrderManagement.jsx`, `seller/SellerOrders.jsx`, `seller/SellerShipping.jsx`, `seller/SellerStaff.jsx`, and `seller/SellerRegister.jsx`.
- Destructive actions in those legacy overlays need explicit confirmation dialogs with `role="dialog"`, `aria-modal`, labelled headings, Escape handling, focus trap, and focus restoration.
- `GoogleAuthModal.jsx` was a custom overlay without the shared dialog contract. Fixed in this audit by migrating it to the shared `Modal`.

#### P1 — consistency and responsive risk

- `LanguageSwitcher.jsx` used hard-coded gray/blue colors, large radius/shadow values, and 10–11px text globally. Fixed by using shared tokens and a minimum 14px menu scale.
- `SellerCustomerCare.jsx` used fixed `h-[600px]`, non-keyboard conversation rows, and 9–11px metadata. Fixed with flexible desktop height, mobile list/chat screens, focusable buttons, and 12px minimum metadata.
- Legacy buyer `Cart.jsx`, seller `SellerOrders.jsx`, seller `SellerStaff.jsx`, auth pages, and admin legacy pages still contain hard-coded palette, spacing, shadow, and radius classes outside the token aliases.
- `CategoryManagement.jsx`, `ProductManagement.jsx`, `OrderManagement.jsx`, `ShopsManagement.jsx`, `TicketManagement.jsx`, and several seller tables need a shared responsive card/list pass; static table overflow is still present in parts of those pages.

#### P2 — completeness and maintainability

- Static-state pages and legacy data screens do not consistently expose all loading, empty, and retryable error states. Highest-risk candidates are account Notifications/Vouchers/Profile/Password, admin Shops/Categories/Moderation/Campaigns/Disputes/Tickets/Finance/Shipping/Roles, and seller Staff/Settings/Customer Care.
- Repeated legacy patterns remain for cards, tabs, custom tables, filters, and modal shells. The approved shared components now exist, but the remaining pages have not all been migrated to them.
- Static review covered the 360px, 768px, and 1280px class breakpoints. Runtime visual verification is still recommended for the legacy pages after their responsive passes.

### High-priority fixes completed in this audit

- `src/components/auth/GoogleAuthModal.jsx`: shared accessible `Modal`, token-based surfaces, visible error state, and no sub-12px copy.
- `src/components/common/LanguageSwitcher.jsx`: shared color/radius/shadow tokens, keyboard-visible focus, menu radio semantics, and minimum 14px language text.
- `src/pages/seller/SellerCustomerCare.jsx`: replaced fixed chat height, added mobile two-screen navigation and keyboard-focusable conversation rows, and removed sub-12px copy in the active chat flow.

### Verification

- Scoped ESLint for the three fixes: passed.
- Production build: passed.
- Known non-blocking build warnings remain: stale Browserslist data and a JavaScript chunk above 500 kB.
