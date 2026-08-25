# UI/UX Audit Report: Mercado Livre Intelligence Platform

## Executive Summary
The Mercado Livre Intelligence Platform provides powerful market intelligence, radar tracking, conversion funnels, and trend analytics for e-commerce sellers. However, a comprehensive UI/UX and Frontend Architecture audit reveals significant usability friction, visual clutter, accessibility non-compliance, and data visualization issues that degrade the overall user experience. Key friction points include overwhelming visual hierarchy on the main dashboard (`src/app/mercado-livre/page.tsx`), fragmented tab/mode navigation without clear URL state persistence, non-reusable/monolithic view components (`RadarView.tsx`, `FunnelView.tsx`, `TrendsView.tsx`), inadequate color contrast and dark mode inconsistencies, illegible chart tooltips/labels in Recharts implementations, and absent loading/error feedback loops. Addressing these items through a structured redesign will drastically reduce cognitive load, improve accessibility to WCAG 2.1 AA standards, and elevate the product to an enterprise-grade SaaS experience.

---

## Category Scores (1 - 10)

| Category | Score | Primary Assessment |
| :--- | :---: | :--- |
| **1. Dashboard Page Navigation & Layout** | **4 / 10** | Overwhelming information density, fragmented mode toggling, lack of cohesive view state management. |
| **2. Component Architecture & Reusability** | **5 / 10** | Tightly-coupled monolithic components (`RadarView`, `FunnelView`, `TrendsView`), duplicate state logic, missing component abstraction. |
| **3. Visual Design & Dark Mode Consistency** | **6 / 10** | Inconsistent color tokens, mismatched spacing scales, dark mode contrast dropouts, unrefined typography hierarchy. |
| **4. Data Visualization (Recharts)** | **4 / 10** | Truncated chart labels, hard-to-read tooltips in dark mode, missing interactive chart legends and responsive containers. |
| **5. User Flows & Navigation Ergonomics** | **5 / 10** | High click-depth for core workflows, dead-end detail states without breadcrumbs, lack of deep-linking support for active tabs. |
| **6. Loading States & Error Handling** | **3 / 10** | Jarring layout shifts (CLS), missing skeleton loaders during data fetch, generic/silent error failures without recovery UI. |
| **7. Mobile Responsiveness** | **4 / 10** | Table overflow issues, squished chart renders on viewports < 768px, unoptimized navigation drawers for mobile. |
| **8. Accessibility (a11y)** | **3 / 10** | Missing ARIA roles on custom tab buttons, low contrast text elements, poor keyboard focus indicators (`outline-none`). |
| **9. Performance & Re-renders** | **5 / 10** | Unnecessary parent re-renders triggered by top-level state changes, unmemoized chart data transformations, N+1 API fetching. |

---

## Top 10 Critical Issues (Ranked by Severity)

1. **[Critical / Accessibility] Missing ARIA Labels & Keyboard Traps in Navigation Tabs**
   - *Impact:* Screen readers fail to convey tab roles/selected states (`role="tab"`, `aria-selected`, `aria-controls`), and keyboard users cannot navigate modes via standard arrow keys.
2. **[Critical / Loading & Error UX] Missing Loading Skeletons & Layout Shift (CLS) on Data Switch**
   - *Impact:* Mode switches cause disruptive content jumps without visual feedback, leading to user disorientation and accidental clicks.
3. **[Critical / Data Viz] Recharts Dark Mode Contrast Collapse & Unreadable Tooltips**
   - *Impact:* Default tooltips render black text on dark backgrounds or white text on light cards without proper background tokens, making data points illegible.
4. **[Critical / Mobile] Unresponsive Data Tables & Broken Chart Layouts on Mobile Viewports**
   - *Impact:* `RadarView` and `FunnelView` data tables overflow horizontally without smooth touch scrolling; Recharts components overflow container bounds on screen widths < 640px.
5. **[High / Navigation] Mode Navigation Lacks URL State Persistence**
   - *Impact:* Navigating between Radar, Trends, Funnel, Watchlist, and Insights relies solely on internal component state. Refreshing or sharing a link resets the view back to default.
6. **[High / Component Architecture] Monolithic Structure of `RadarView.tsx` & `TrendsView.tsx`**
   - *Impact:* Data fetching, state management, table presentation, and modal overlays are tightly coupled in single 500+ line files, impairing maintainability and reusability.
7. **[High / Visual Hierarchy] Dashboard Top Header Clutter & Cognitive Overload**
   - *Impact:* Essential global actions (filters, search, export, date range) are squeezed alongside mode tabs without visual grouping or secondary action hierarchy.
8. **[High / Performance] Unmemoized Heavy Data Processing in `TrendsView` Chart Pipelines**
   - *Impact:* Complex array mappings and trend aggregations re-run on every parent re-render, causing perceptible UI thread stutter during filter adjustments.
9. **[Medium / Error Handling] Silent API Failure Handling & Lack of Retry Mechanisms**
   - *Impact:* When network calls fail or rate limits are reached, views display empty components without contextual error banners or retry actions.
10. **[Medium / Usability] Missing Breadcrumbs & Contextual Return Paths in Detail Views**
    - *Impact:* Drifting into product deep-dives or category detail drawers leaves users stranded without a clear one-click path back to their active segment.

---

## Top 10 Quick Wins (High Impact / Easy Implementation)

1. **Standardize Mode Tabs with URL Search Params (`?view=radar`)**: Sync active mode tab state with URL query parameters for shareable links and browser back/forward history support.
2. **Inject Recharts Custom Tooltip Component with Standardized Styling**: Implement a shared `CustomChartTooltip` with themed background, border, and readable typography across all views.
3. **Add Global Skeleton Component Loaders**: Replace blank loading states in `RadarView` and `TrendsView` with `ShimmerSkeleton` placeholders.
4. **Fix Horizontal Table Scrolling with `overflow-x-auto` & Sticky Headers**: Enclose data tables in responsive wrappers with `sticky top-0 z-10` header columns.
5. **Apply Standardized ARIA Attributes to Tab List**: Add `role="tablist"`, `role="tab"`, `aria-selected={isActive}`, and `tabIndex={isActive ? 0 : -1}` across mode switchers.
6. **Harmonize Color Palette Tokens**: Unify status badges (e.g., green for positive growth, red for drop, yellow for warning) using Tailwind theme variables.
7. **Add Focus Ring Indicators (`focus-visible:ring-2 focus-visible:ring-amber-500`)**: Ensure all interactive buttons and inputs display high-visibility focus rings for keyboard navigation.
8. **Implement Empty State Placeholders with Call-to-Actions**: Display friendly empty states with "Reset Filters" or "Add Keywords" buttons when data returns empty arrays.
9. **Memoize Chart Series Computation with `useMemo`**: Wrap chart data processing logic in `useMemo` to eliminate unnecessary calculations on component re-render.
10. **Add Quick Filter Chips for Time Periods (7d / 30d / 90d / YTD)**: Provide instant one-click preset buttons next to date selectors.

---

## Detailed Findings per Category

### 1. Dashboard Page (`src/app/mercado-livre/page.tsx`)
- **Visual Clutter:** The top bar attempts to combine branding, marketplace selectors, search inputs, date pickers, global filters, and view mode tabs in a single dense row.
- **Navigation Structure:** Modes (Radar, Trends, Funnel, Watchlist, Insights) are rendered as tab buttons without clear visual distinction between primary navigation and sub-view controls.
- **State Management:** Switching views resets local sub-filters (e.g., category selection in Radar does not persist when returning from Trends).

### 2. Components (`RadarView.tsx`, `FunnelView.tsx`, `TrendsView.tsx`)
- **Tight Coupling:** Components handle their own API queries, data formatting, chart configurations, and modal state internally.
- **Duplicated UI Patterns:** Filter bars, search inputs, pagination controls, and status badges are re-implemented across all three files with minor variations in styling and behavior.
- **Prop Drilling:** Complex nested controls pass handlers down multiple levels instead of using a lightweight context or custom hook (`useMercadoLivreFilters`).

### 3. Visual Design & Dark Mode Consistency
- **Color Palette Drift:** Uses disparate color shades for similar indicators (e.g., `#10B981` vs `emerald-500` vs `#22C55E` for positive metrics).
- **Dark Mode Contrast:** Text in muted subtitle elements (`text-slate-400` on light background or `text-gray-500` on dark background) fails WCAG 4.5:1 contrast requirements.
- **Typography & Grid:** Inconsistent font weight usage for numerical data points (mixing `font-semibold` and `font-light`) and irregular grid gap spacing (`gap-3`, `gap-5`, `gap-6`).

### 4. Data Visualization (Recharts)
- **Axis Label Truncation:** Long category names on X-Axis in `TrendsView` get clipped without angle rotation or truncated ellipses.
- **Legend & Series Toggle:** Users cannot toggle series visibility by clicking chart legend items.
- **Tooltip Styling:** Default Recharts tooltips display raw unformatted key-value pairs without currency (`R$`) or percentage formatting.

### 5. User Flows & Navigation Ergonomics
- **Click Depth:** Accessing category competitor insights requires selecting Radar -> Filter Category -> Click Item -> Open Modal (4 clicks).
- **Dead Ends:** Modal popups for detailed seller metrics lack external direct links to Mercado Livre listings or deep-link sharing.

### 6. Loading States & Error Handling
- **Abrupt UI Flashes:** Content renders blank white/dark cards while fetching before content abruptly pops in.
- **Error Messages:** Network errors fail silently or log to `console.error` without presenting user-facing toast notifications or fallback retry containers.

### 7. Mobile Responsiveness
- **Layout Breakages:** Multi-column summary cards collapse into awkward single-column lists with extreme vertical scrolling.
- **Chart Truncation:** Fixed-height chart containers cut off legends on screens smaller than 375px.

### 8. Accessibility (a11y)
- **Keyboard Navigation:** Tab switches cannot be navigated using `ArrowLeft` and `ArrowRight` keys.
- **Icon-Only Buttons:** Action icons (refresh, export, settings) lack `aria-label` or visually hidden screen reader text.

### 9. Performance & Re-renders
- **Unnecessary Fetching:** Switching mode tabs triggers redundant refetches of baseline marketplace data.
- **Large DOM Tree:** Data tables render hundreds of hidden DOM nodes without row virtualization.

---

## Recommended Redesign Priorities

1. **Phase 1: Foundation & Accessibility (P0)**
   - Standardize ARIA attributes and keyboard navigation.
   - Fix dark mode color contrast ratios.
   - Implement global skeleton loaders and error boundary fallback UI.
2. **Phase 2: Component Refactoring & UX Navigation (P1)**
   - Refactor `RadarView`, `FunnelView`, and `TrendsView` into modular sub-components.
   - Implement URL search parameter sync for active modes and global filters.
   - Upgrade Recharts charts with responsive containers, formatted tooltips, and interactive legends.
3. **Phase 3: Visual Polish & Micro-Interactions (P2)**
   - Apply consistent design token scale (spacing, typography, status colors).
   - Add Framer Motion transitions for smooth mode switching and modal animations.
   - Optimize mobile drawer navigation and touch interactions.

---

## Wireframe Suggestions (ASCII Diagrams)

### Desktop Improved Layout (`src/app/mercado-livre/page.tsx`)

```
+-----------------------------------------------------------------------------------+
|  [LOGO] Mercado Livre Intelligence   | [Search Category/Product...] | [User/Profile] |
+-----------------------------------------------------------------------------------+
|  MODES:  [ (•) Radar ]  [ Trend Analytics ]  [ Funnel ]  [ Watchlist ] [ Insights]|
+-----------------------------------------------------------------------------------+
|  FILTERS: [Date: Last 30d v] [Cat: Electronics v] [State: SP v]  [ Clear ] [Export]|
+-----------------------------------------------------------------------------------+
| +-------------------------+ +-------------------------+ +-----------------------+ |
| | Total Volume (GMV)      | | Avg Conversion Rate     | | Active Competitors    | |
| | R$ 1,450,000 (+12.4%)   | | 3.82% (+0.4%)           | | 1,240 (-3)            | |
| +-------------------------+ +-------------------------+ +-----------------------+ |
|                                                                                   |
| +-------------------------------------------------------------------------------+ |
| | VIEW CONTENT AREA (e.g. Radar / Trends / Funnel)                              | |
| | +-------------------------------------+ +-----------------------------------+ | |
| | | Primary Chart / Heatmap             | | Segment Insights & Recommendations| | |
| | | [Recharts Container - Responsive]   | | - Growth opp in sub-category X  | | |
| | |                                     | | - Price pressure on top item Y  | | |
| | +-------------------------------------+ +-----------------------------------+ | |
| |                                                                               | |
| | +---------------------------------------------------------------------------+ | |
| | | Responsive Data Table with Sticky Header & Pagination                     | | |
| | | [ Rank | Product Name | Seller | Price | Sales Vol | Conversion | Action ]| | |
| | +---------------------------------------------------------------------------+ | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

### Mobile Layout Blueprint (< 768px)

```
+------------------------------------+
| [≡] ML Intel       [Search 🔍]     |
+------------------------------------+
| View: [ Radar v ]  [Filters ⚙️ (2)] |
+------------------------------------+
| METRIC CARDS (Horizontal Scroll)  |
| [ R$ 1.45M ] [ 3.82% ] [ 1,240 ]  |
+------------------------------------+
| MAIN CHART (Adaptive Height)       |
| +--------------------------------+ |
| | Trend Line / Radar Chart       | |
| +--------------------------------+ |
+------------------------------------+
| DATA LIST (Card View for Mobile)   |
| +--------------------------------+ |
| | #1 Product Name                | |
| | Price: R$ 299.00 | Sales: 420    | |
| | Status: [ High Demand ]        | |
| +--------------------------------+ |
| | #2 Product Name                | |
| | Price: R$ 149.00 | Sales: 310    | |
| +--------------------------------+ |
+------------------------------------+
```
