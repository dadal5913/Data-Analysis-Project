# QuantLab Frontend — Design System

This document explains the visual language of the redesigned QuantLab dashboard: which products inspired it, the design tokens, the component conventions, and how to extend the UI consistently.

---

## 1. Reference products

The design chases the look and feel of modern analytics / quant tooling. The main references are:

| Product | What we borrow |
|---------|----------------|
| **Linear** | Refined dark palette, dense typography, careful spacing, subtle gradients, snappy `animate-fade-in` entrances. |
| **Vercel Dashboard** | Near-black canvas, translucent cards, soft radial glow, clean topbar with breadcrumbs. |
| **Supabase Studio** | Sidebar groups ("Workspace", "Resources"), active-item pill, icon + label nav, in-sidebar user card with logout. |
| **Stripe Dashboard** | KPI cards with label + large tabular-nums value + delta chip; semantic success/danger colors. |
| **TradingView / Grafana** | Monospace numerals for prices and metrics, clear positive/negative semantics on PnL, compact data tables. |
| **shadcn/ui** | Token-first Tailwind setup, variant-driven primitives (`Button`, `Card`, `Input`, `Badge`), consistent radii and focus ring. |

Everything is implemented with the stack that was already in the repo — **Tailwind**, **React**, **Next.js 14 (app router)**, **Plotly**. No new dependencies were added, so rebuilds don't pay for another `npm install`.

---

## 2. Design tokens

All tokens live in `frontend/tailwind.config.ts` and base styles in `frontend/src/app/globals.css`.

### 2.1 Color system

The palette is a deep slate base with a single blue primary and two semantic accents.

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0A0C12` | Page canvas |
| `bg-muted` | `#0D1017` | Sidebar column |
| `surface` | `#0F131C` | Cards, inputs background |
| `surface-elevated` | `#141926` | Icon tiles, badge bg |
| `surface-hover` | `#1A2030` | Row hover |
| `border` | `#1F2636` | Default border |
| `border-strong` | `#2A3346` | Hover border, chart gridlines |
| `foreground` | `#E7ECF3` | Primary text |
| `foreground-muted` | `#8892A6` | Labels, secondary text |
| `foreground-subtle` | `#5C6578` | Hints, metadata |
| `accent` | `#5B8CFF` | Primary action, links, active nav |
| `success` | `#22C55E` | Positive returns, healthy Sharpe |
| `danger` | `#EF4444` | Drawdown, negative PnL, destructive |
| `warning` | `#F59E0B` | Soft warnings |

Semantic tokens also expose `-subtle` variants (e.g. `bg-success-subtle`) for tinted badge / chip backgrounds.

### 2.2 Typography

Loaded via Google Fonts `<link>` in the root layout:

- **Inter** — UI text (weights 400 / 500 / 600 / 700).
- **JetBrains Mono** — numbers and code-like tokens (prices, IDs, metric values).

Helpers:

- `font-display` — Inter with tight letter-spacing for large headings.
- `font-mono` — JetBrains Mono for tabular data.
- `tabular-nums` utility — forces tabular figures even on Inter.
- `text-2xs` — 11/16 for dense eyebrows, badges, metadata.

### 2.3 Radii, shadows, motion

- Radii: `sm 6`, `md 10`, `lg 12`, `xl 16`, `2xl 20` (px).
- `shadow-card` — subtle inset highlight + soft drop shadow for cards.
- `shadow-pop` — stronger elevation for dialogs and the auth card.
- `shadow-glow` — accent ring + halo for hero actions (reserved).
- `animate-fade-in` — 180 ms up-drift used on route change.
- `animate-shimmer` — loading skeletons (utility `.shimmer`).

### 2.4 Backgrounds

`body` carries a **triple radial glow** (top-left blue, top-right green, bottom center blue) on a near-black base. Combined with `bg-grid` utility, we get the "data lab" feel without visual noise.

---

## 3. Layout system

### 3.1 Shell

```
┌────────────┬───────────────────────────────────────────────┐
│  Sidebar   │  Topbar (breadcrumb · live feed badge · ver)   │
│  (brand,   ├───────────────────────────────────────────────┤
│  workspace │                                               │
│  nav,      │  <main max-w-[1400px] px-6 py-8>              │
│  user)     │    <PageHeader />                             │
│            │    <sections…>                                │
└────────────┴───────────────────────────────────────────────┘
```

- **Sidebar** (`components/layout/sidebar.tsx`) — 248 px, grouped nav with Lucide-style inline SVG icons, active-item shown with `bg-accent-subtle` + a tiny glowing dot.
- **Topbar** (`components/layout/topbar.tsx`) — sticky, glass, auto-generated breadcrumbs from the URL, a "Live market feed" status badge.
- **Page container** — `max-w-[1400px]`, consistent 8-unit vertical rhythm, fades in on mount.

### 3.2 Auth pages

Centered card on the same radial background, with brand mark + subtitle, a dismissible demo-credentials hint, and field-level errors.

---

## 4. Component conventions

All primitives live in `frontend/src/components/ui/*`. They are intentionally small and prop-driven.

### Button

```tsx
<Button variant="primary" size="md" leftIcon={<IconPlay size={14} />}>
  Run Backtest
</Button>
```

Variants: `primary | secondary | ghost | outline | danger`. Sizes: `sm | md | lg`. Disabled state respects `cursor-not-allowed` and `opacity-60`.

### Card

```tsx
<Card padded={false}>
  <CardHeader title="Recent Backtests" description="…" action={<Button …/>} />
  {/* body */}
</Card>
```

Pass `padded={false}` when you want the header in a specific position (e.g. card contains a full-bleed table).

### Input / Select / Field

- `Input` supports `leftIcon` and `invalid` for error states.
- `Select` wraps the native `<select>` with a chevron icon and the same focus styling.
- `Field` composes `label + control + hint / error` in a vertical stack.

### KpiCard

```tsx
<KpiCard
  label="Latest Total Return"
  value="+12.34%"
  icon={<IconTrendingUp size={14} />}
  tone="success"
  delta={{ direction: "up", value: "+12.34%", label: "on last run" }}
/>
```

Keeps a plain `label` and `value` text to stay compatible with existing tests (`getByText("Sharpe")`, `getByText("1.20")`).

### Badge

Five variants (`neutral | accent | success | danger | warning`) with pill shape and optional leading icon; used in topbar, strategy cards, and signal column in trade tables.

### PageHeader

Eyebrow + title + description + actions, separated from content by a soft bottom border. Used at the top of every page.

### Table pattern

Tables live inside a `Card padded={false}` with:

1. A filter/search row in a `border-b` top bar.
2. A `thead` with uppercase 11-px column labels.
3. `tbody` using `divide-y divide-border/60` and row hover `bg-surface-hover`.
4. `TablePagination` at the bottom, with chevron icons and `X / page` selector.

---

## 5. Semantic data conventions

These are the rules we use consistently across the dashboard:

- **Positive numbers** (`>= 0`) render in **success green** (`text-success`) with a `+` prefix.
- **Negative numbers** render in **danger red** (`text-danger`).
- **Prices / metric values** always use `font-mono tabular-nums` so that decimal points line up across rows.
- **IDs** use `font-mono` with `text-foreground-muted`.
- **Dates** are muted; only the metric itself is full-strength text.
- **Status** — "Live market feed" badge in topbar when streaming; danger banner for errors; dashed border + icon empty state when a collection is empty.

---

## 6. Charts

Plotly charts share one theme:

- Transparent `paper_bgcolor` and `plot_bgcolor` so the card background shines through.
- `#5B8CFF` (accent) for primary series.
- `#EF4444` (danger) for drawdowns.
- Inter font for labels; JetBrains Mono in hover labels.
- Gridlines at `rgba(42, 51, 70, 0.4)`, no zero line by default (except drawdown which emphasizes zero).
- Responsive (`useResizeHandler`, `style={{ width: "100%" }}`) and non-interactive mode bar hidden.

---

## 7. Accessibility

- Global `:focus-visible` ring: `2 px` offset on page bg + `4 px` accent halo (works on buttons, links, inputs, native selects).
- Inputs use `placeholder:text-foreground-subtle` and keep placeholders for existing tests.
- Error banner has `role="alert"` and leading `IconAlertCircle`.
- All interactive icons have accessible labels via `title` or wrapping text.
- Contrast: body text `#E7ECF3` on `#0A0C12` ≈ 14.7:1; muted `#8892A6` on `#0A0C12` ≈ 6.4:1.

---

## 8. Extending the UI

A few rules of thumb:

1. **Reach for tokens first.** Don't hardcode hex outside `tailwind.config.ts`. Use `text-foreground-muted`, not `text-[#8892A6]`.
2. **Numbers are mono and tabular.** Any column of numbers gets `font-mono tabular-nums`.
3. **Compose primitives.** A new page should start with `PageHeader` → one or more `Card` sections → optional table. Avoid ad-hoc `div bg-surface` mixes.
4. **Stay icon-light.** One icon per Card/Field is enough. The icon set in `components/ui/icons.tsx` has ~20 inline SVGs; add new ones there instead of pulling in a package.
5. **Animate sparingly.** `animate-fade-in` on page mount, hover color transitions; don't animate data.
6. **Keep semantic colors honest.** Green means "good", red means "bad" — only apply them when the number has a clear direction.

---

## 9. File map

```
frontend/src/
├─ app/
│  ├─ globals.css              ← tokens + base styles
│  ├─ layout.tsx               ← root shell + font <link>
│  ├─ (auth)/
│  │  ├─ login/page.tsx        ← centered card, demo hint
│  │  └─ register/page.tsx
│  └─ dashboard/
│     ├─ layout.tsx            ← sidebar + topbar shell
│     ├─ page.tsx              ← KPI row, recent backtests, watchlist
│     ├─ backtests/
│     │  ├─ page.tsx           ← run form + history table
│     │  └─ [id]/page.tsx      ← KPIs, equity/dd charts, trades
│     ├─ datasets/page.tsx     ← upload card + table
│     ├─ strategies/page.tsx   ← strategy cards with param dl
│     └─ ml/page.tsx           ← train form + KPIs + charts
├─ components/
│  ├─ brand/logo.tsx           ← gradient mark + wordmark
│  ├─ charts/                  ← Plotly wrappers (shared theme)
│  ├─ dashboard/
│  │  ├─ kpi-card.tsx
│  │  └─ watchlist.tsx
│  ├─ layout/
│  │  ├─ auth-guard.tsx
│  │  ├─ sidebar.tsx
│  │  └─ topbar.tsx
│  └─ ui/
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ empty-state.tsx
│     ├─ error-banner.tsx
│     ├─ field.tsx
│     ├─ icons.tsx            ← inline SVG set
│     ├─ input.tsx
│     ├─ loading-spinner.tsx
│     ├─ page-header.tsx
│     ├─ select.tsx
│     ├─ table-pagination.tsx
│     └─ table-search.tsx
└─ tailwind.config.ts          ← color / font / radii / shadow tokens
```

---

## 10. Changelog summary

Compared to the previous UI:

- Swapped flat `#0b1020` canvas for a layered dark slate with soft radial glow and Inter + JetBrains Mono.
- Added an icon-driven sidebar with active pill state, a sticky breadcrumbed topbar, and a 1400-px page container.
- Every primitive was rebuilt around tokens and variants (Button, Card, Input, Select, Badge, PageHeader, Field, etc.).
- KPI cards grew icons and delta chips; tables got zebra-less divide borders, uppercase column headers, tabular-nums, and semantic color PnL.
- Auth pages became a single centered card with brand, demo hint and inline validation instead of a bare form.
- Charts switched to a shared transparent theme that inherits the card background and uses the accent + danger tokens.
