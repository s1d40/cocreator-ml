# Implementation Tasks: Mercado Livre UX Improvements

This document outlines the structured backlog of actionable implementation tasks derived from the UI/UX audit of the Mercado Livre Intelligence Platform.

---

## P0: Critical Fixes (Broken UX, Accessibility Violations & Layout Failures)

- [ ] **TASK-P0-01: Standardize Mode Navigation ARIA & Keyboard Support**
  - **Location:** `src/app/mercado-livre/page.tsx`
  - **Details:** Add `role="tablist"` to the navigation container and `role="tab"`, `aria-selected={activeView === tab.id}`, `aria-controls={`panel-${tab.id}`}` to tab buttons. Add `ArrowLeft`/`ArrowRight` keyboard navigation. Add `focus-visible:ring-2 focus-visible:ring-amber-500` focus indicators.

- [ ] **TASK-P0-02: Implement Loading Skeletons & Prevent Layout Shift (CLS)**
  - **Location:** `src/components/RadarView.tsx`, `src/components/TrendsView.tsx`, `src/components/FunnelView.tsx`
  - **Details:** Create reusable `SkeletonCard` and `SkeletonTable` components. Replace blank loading states with structured skeletons matching final component layouts to reduce CLS to < 0.1.

- [ ] **TASK-P0-03: Fix Recharts Dark Mode Contrast & Tooltip Rendering**
  - **Location:** `src/components/TrendsView.tsx`, `src/components/FunnelView.tsx`
  - **Details:** Create custom `CustomChartTooltip` component with high-contrast background tokens (`bg-slate-900/90 dark:bg-slate-800/95`), explicit text styling (`text-slate-100`), and formatted values (Currency R$, %, quantities).

- [ ] **TASK-P0-04: Fix Mobile Table & Container Overflow**
  - **Location:** `src/components/RadarView.tsx`, `src/components/FunnelView.tsx`
  - **Details:** Enclose tables in `overflow-x-auto` responsive containers with custom touch scrolling (`-webkit-overflow-scrolling: touch`). Add sticky table header columns (`sticky top-0 z-10`). Ensure table cards fallback gracefully on screen widths < 640px.

- [ ] **TASK-P0-05: Audit & Remediate Low Color Contrast Elements**
  - **Location:** Global design tokens & muted text elements across all views
  - **Details:** Increase text contrast on subtitles (`text-slate-400` -> `text-slate-600` in light mode, `text-slate-300` in dark mode) to achieve minimum 4.5:1 ratio for standard text (WCAG 2.1 AA).

---

## P1: High-Impact Improvements (Navigation, Data Viz & Responsive Layout)

- [ ] **TASK-P1-01: Synchronize View Mode & Global Filters with URL Query Params**
  - **Location:** `src/app/mercado-livre/page.tsx`
  - **Details:** Integrate Next.js `useSearchParams` and `useRouter`. Sync active mode (`?view=radar|trends|funnel|watchlist|insights`) and filter states (category, date range) with URL parameters to enable deep-linking and browser back/forward support.

- [ ] **TASK-P1-02: Deconstruct Monolithic View Components into Modular Architecture**
  - **Location:** `src/components/RadarView.tsx`, `src/components/TrendsView.tsx`, `src/components/FunnelView.tsx`
  - **Details:** Extract sub-components into modular files:
    - `src/components/radar/RadarFilterBar.tsx`
    - `src/components/radar/RadarDataTable.tsx`
    - `src/components/trends/TrendsChartSection.tsx`
    - `src/components/common/MetricsSummaryCards.tsx`

- [ ] **TASK-P1-03: Upgrade Recharts Responsive Containers & Axis Label Rotation**
  - **Location:** `src/components/TrendsView.tsx`, `src/components/FunnelView.tsx`
  - **Details:** Wrap all charts in `<ResponsiveContainer width="100%" height={350}>`. Angle X-axis labels at `-35` degrees with ellipsis truncation to prevent label clipping on medium/small viewports.

- [ ] **TASK-P1-04: Implement Global Error Boundaries & API Retry UI**
  - **Location:** `src/app/mercado-livre/page.tsx`, `src/components/common/ErrorBoundary.tsx`
  - **Details:** Create an `ErrorBanner` component displaying human-readable error messages and a "Try Again" button. Wrap view sections in React Error Boundaries to prevent full-page crashes during API failures.

- [ ] **TASK-P1-05: Add One-Click Preset Date & Segment Filters**
  - **Location:** Global Filter Header
  - **Details:** Add preset quick-filter chips ("Last 7 Days", "Last 30 Days", "Quarter to Date", "Top 10 Category Winners") for faster user data exploration.

---

## P2: Polish (Animations, Micro-Interactions, Performance & Premium Feel)

- [ ] **TASK-P2-01: Add Smooth View Mode Transitions with Framer Motion**
  - **Location:** `src/app/mercado-livre/page.tsx`
  - **Details:** Implement subtle cross-fade and slide transitions (`AnimatePresence` and `motion.div`) when switching view modes.

- [ ] **TASK-P2-02: Interactive Chart Legends & Series Toggling**
  - **Location:** `src/components/TrendsView.tsx`
  - **Details:** Make Recharts legend items interactive, allowing users to toggle specific metric series (e.g., GMV vs Units Sold vs Ad Spend) on and off.

- [ ] **TASK-P2-03: Implement Mobile Drawer Navigation & Touch Gestures**
  - **Location:** `src/app/mercado-livre/page.tsx`
  - **Details:** Replace cramped mobile top bar with a slide-out drawer navigation for filter controls and view switching on mobile screens (< 768px).

- [ ] **TASK-P2-04: Rich Empty State Illustrations & Action Placeholders**
  - **Location:** All View Components
  - **Details:** Create engaging empty states for zero search results or empty watchlists with context-aware CTA buttons ("Add First Keyword", "Reset Category Filters").

- [ ] **TASK-P2-05: Optimize Data Processing Performance with `useMemo` & `useCallback`**
  - **Location:** `src/components/TrendsView.tsx`, `src/components/RadarView.tsx`
  - **Details:** Memoize complex data aggregation functions and table sorting algorithms to eliminate main-thread stutter during quick filter adjustments.
