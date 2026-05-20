---
version: alpha
name: Teal Glass
description: "A modern enterprise SaaS aesthetic inspired by sub2api: teal primary (#14b8a6), glass-morphism surfaces, soft shadows, and rounded-xl components. Built on Element Plus with custom theming. Dark mode ready with class strategy."

colors:
  primary:
    50: '#f0fdfa'
    100: '#ccfbf1'
    200: '#99f6e4'
    300: '#5eead4'
    400: '#2dd4bf'
    500: '#14b8a6'
    600: '#0d9488'
    700: '#0f766e'
    800: '#115e59'
    900: '#134e4e'
    950: '#042f2e'
  accent:
    50: '#f8fafc'
    100: '#f1f5f9'
    200: '#e2e8f0'
    300: '#cbd5e1'
    400: '#94a3b8'
    500: '#64748b'
    600: '#475569'
    700: '#334155'
    800: '#1e293b'
    900: '#0f172a'
    950: '#020617'
  dark:
    50: '#f8fafc'
    100: '#f1f5f9'
    200: '#e2e8f0'
    300: '#cbd5e1'
    400: '#94a3b8'
    500: '#64748b'
    600: '#475569'
    700: '#334155'
    800: '#1e293b'
    900: '#0f172a'
    950: '#020617'
  semantic:
    success: '#10b981'
    warning: '#f59e0b'
    error: '#ef4444'
    info: '#3b82f6'

typography:
  fontFamily:
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif'
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  sizes:
    xs: '0.75rem'
    sm: '0.875rem'
    base: '1rem'
    lg: '1.125rem'
    xl: '1.25rem'
    '2xl': '1.5rem'
    '3xl': '1.875rem'

rounded:
  none: '0px'
  sm: '0.25rem'
  DEFAULT: '0.5rem'
  md: '0.5rem'
  lg: '0.75rem'
  xl: '1rem'
  '2xl': '1.5rem'
  full: '9999px'

shadows:
  glass: '0 8px 32px rgba(0, 0, 0, 0.08)'
  glass-sm: '0 4px 16px rgba(0, 0, 0, 0.06)'
  card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
  card-hover: '0 10px 40px rgba(0, 0, 0, 0.08)'
  inner-glow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'

animations:
  fade-in: 'fadeIn 0.3s ease-out'
  slide-up: 'slideUp 0.3s ease-out'
  slide-down: 'slideDown 0.3s ease-out'
  slide-in-right: 'slideInRight 0.3s ease-out'
  scale-in: 'scaleIn 0.2s ease-out'

keyframes:
  fadeIn:
    '0%': opacity: '0'
    '100%': opacity: '1'
  slideUp:
    '0%': opacity: '0', transform: 'translateY(10px)'
    '100%': opacity: '1', transform: 'translateY(0)'
  slideDown:
    '0%': opacity: '0', transform: 'translateY(-10px)'
    '100%': opacity: '1', transform: 'translateY(0)'
  slideInRight:
    '0%': opacity: '0', transform: 'translateX(20px)'
    '100%': opacity: '1', transform: 'translateX(0)'
  scaleIn:
    '0%': opacity: '0', transform: 'scale(0.95)'
    '100%': opacity: '1', transform: 'scale(1)'

components:
  btn:
    base: 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]'
  btn-primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/30'
  btn-secondary: 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-600 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-700'
  btn-ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
  btn-danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 hover:from-red-600 hover:to-red-700'
  btn-success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700'
  btn-sm: 'rounded-lg px-3 py-1.5 text-xs'
  btn-lg: 'rounded-2xl px-6 py-3 text-base'
  btn-icon: 'rounded-xl p-2.5'

  input: 'w-full rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-dark-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
  input-error: 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
  input-label: 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
  input-hint: 'mt-1 text-xs text-gray-500 dark:text-dark-400'

  card: 'bg-white dark:bg-dark-800/50 rounded-2xl border border-gray-100 dark:border-dark-700/50 shadow-card transition-all duration-300'
  card-hover: 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-200 dark:hover:border-dark-600'
  card-glass: 'bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border border-white/20 dark:border-dark-700/50 shadow-glass'
  card-header: 'border-b border-gray-100 dark:border-dark-700 px-6 py-4'
  card-body: 'p-6'
  card-footer: 'border-t border-gray-100 dark:border-dark-700 px-6 py-4'

  stat-card: 'card p-5 flex items-start gap-4'
  stat-icon: 'h-12 w-12 rounded-xl flex items-center justify-center text-xl'
  stat-icon-primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
  stat-icon-success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
  stat-value: 'text-2xl font-bold text-gray-900 dark:text-white truncate'
  stat-label: 'text-sm text-gray-500 dark:text-dark-400'

  table-container: 'overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-700'
  table: 'w-full text-sm'
  table-th: 'px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-800/50 border-b border-gray-200 dark:border-dark-700'
  table-td: 'px-4 py-3 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-dark-800'
  table-tr-hover: 'hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors duration-150'

  badge: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium'
  badge-primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
  badge-success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  badge-warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  badge-danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  badge-gray: 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-dark-300'

  dropdown: 'absolute z-50 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 shadow-lg py-1 origin-top-right animate-scale-in'
  dropdown-item: 'px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 cursor-pointer transition-colors flex items-center gap-2'

  modal-overlay: 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4'
  modal-content: 'w-full max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 flex flex-col'
  modal-header: 'border-b border-gray-200 dark:border-dark-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between flex-shrink-0'
  modal-title: 'text-lg font-semibold text-gray-900 dark:text-white'
  modal-body: 'px-4 py-3 sm:px-6 sm:py-4 flex-1 overflow-y-auto'
  modal-footer: 'border-t border-gray-200 dark:border-dark-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-end gap-3 flex-shrink-0'

  toast: 'fixed right-4 top-4 z-[100] min-w-[320px] max-w-md bg-white dark:bg-dark-800 rounded-xl shadow-lg border-l-4 p-4 animate-slide-in-right'
  toast-success: 'border-l-emerald-500'
  toast-error: 'border-l-red-500'
  toast-warning: 'border-l-amber-500'
  toast-info: 'border-l-primary-500'

  sidebar: 'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 flex flex-col transition-transform duration-300'
  sidebar-header: 'h-16 px-6 flex items-center gap-3 border-b border-gray-100 dark:border-dark-800'
  sidebar-nav: 'flex-1 overflow-y-auto px-3 py-4'
  sidebar-link: 'flex items-center gap-3 rounded-xl py-2.5 overflow-hidden text-sm font-medium text-gray-600 dark:text-dark-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'
  sidebar-link-active: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
  sidebar-section: 'mb-6'
  sidebar-section-title: 'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500'

  page-header: 'mb-6'
  page-title: 'text-2xl font-bold text-gray-900 dark:text-white'
  page-description: 'mt-1 text-sm text-gray-500 dark:text-dark-400'

  empty-state: 'flex flex-col items-center justify-center px-4 py-12 text-center'
  empty-state-icon: 'mb-4 h-16 w-16 text-gray-300 dark:text-dark-600'
  empty-state-title: 'mb-1 text-lg font-medium text-gray-900 dark:text-white'
  empty-state-description: 'max-w-sm text-sm text-gray-500 dark:text-dark-400'

  spinner: 'h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin'
  skeleton: 'animate-pulse rounded bg-gray-200 dark:bg-dark-700'

  tabs: 'flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-dark-800'
  tab: 'rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-dark-400 transition-all duration-200 hover:text-gray-900 dark:hover:text-white'
  tab-active: 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'

  progress: 'h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700'
  progress-bar: 'h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300'

  switch: 'relative h-6 w-11 cursor-pointer rounded-full bg-gray-300 dark:bg-dark-600 transition-colors duration-200'
  switch-active: 'bg-primary-500'
  switch-thumb: 'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200'
  switch-active-thumb: 'translate-x-5'

  code: 'font-mono text-sm bg-gray-100 dark:bg-dark-800 rounded px-1.5 py-0.5 text-primary-600 dark:text-primary-400'
  code-block: 'font-mono text-sm bg-gray-900 text-gray-100 overflow-x-auto rounded-xl p-4'
---

## Overview

This design system is adapted from **sub2api** (Wei-Shaw/sub2api) for the work-order-frontend project. It replaces the original Element Plus styling with a modern **Teal Glass** aesthetic featuring:

- **Teal Primary** (#14b8a6) — the single brand accent
- **Glass Morphism** — frosted glass panels with `backdrop-blur-xl`
- **Soft Shadows** — subtle `shadow-card` and `shadow-glass` effects
- **Dark Mode** — `class` strategy with full dark palette support
- **Rounded-xl** — 12px border radius for cards, buttons, and inputs

**Tech Stack:** Vue 3.5 + Vite 6 + Element Plus 2.9 + Pinia + TypeScript

**Key Characteristics:**
- Sub2api's glass-morphism with Element Plus components
- Teal/Cyan primary color system (primary-500: #14b8a6)
- Soft rounded corners (rounded-xl / rounded-2xl)
- CSS custom properties for theming
- Dark mode ready via `dark:` class strategy

## Colors

### Primary (Teal/Cyan)

The primary palette uses **teal** tones — a teal/cyan blend that reads as modern and professional without being generic blue.

| Token | Hex | Use |
|-------|-----|-----|
| `primary-50` | #f0fdfa | Lightest tint, hover backgrounds |
| `primary-100` | #ccfbf1 | Badge backgrounds, subtle highlights |
| `primary-200` | #99f6e4 | Active states, selected items |
| `primary-300` | #5eead4 | Borders on dark mode |
| `primary-400` | #2dd4bf | Hover on dark backgrounds |
| **`primary-500`** | #14b8a6 | **Primary brand color — buttons, links, accents** |
| `primary-600` | #0d9488 | Primary hover state |
| `primary-700` | #0f766e | Pressed states |
| `primary-800` | #115e59 | Dark mode surfaces |
| `primary-900` | #134e4e | Dark mode backgrounds |
| `primary-950` | #042f2e | Darkest — footer, contrast areas |

### Accent (Slate)

Neutral slate palette for text and secondary surfaces.

| Token | Hex | Use |
|-------|-----|-----|
| `accent-50` | #f8fafc | Lightest background |
| `accent-100` | #f1f5f9 | Subtle section backgrounds |
| `accent-200` | #e2e8f0 | Disabled backgrounds |
| `accent-300` | #cbd5e1 | Borders, dividers |
| `accent-400` | #94a3b8 | Muted text |
| `accent-500` | #64748b | Secondary text |
| `accent-600` | #475569 | Tertiary elements |
| `accent-700` | #334155 | Headings on light |
| `accent-800` | #1e293b | Dark mode text |
| `accent-900` | #0f172a | Dark mode headings |
| `accent-950` | #020617 | Darkest surfaces |

### Dark Mode Palette

Separate dark palette for dark mode surfaces (different from accent):

| Token | Hex | Use |
|-------|-----|-----|
| `dark-50` | #f8fafc | Lightest in dark context |
| `dark-100` | #f1f5f9 | Hover on dark |
| `dark-200` | #e2e8f0 | Disabled on dark |
| `dark-300` | #cbd5e1 | Muted text on dark |
| `dark-400` | #94a3b8 | Secondary text on dark |
| `dark-500` | #64748b | Tertiary on dark |
| `dark-600` | #475569 | Borders on dark |
| `dark-700` | #334155 | Card backgrounds |
| `dark-800` | #1e293b | Main dark surface |
| `dark-900` | #0f172a | Sidebar, header |
| `dark-950` | #020617 | Darkest — overlays |

### Semantic Colors

| Token | Hex | Use |
|-------|-----|-----|
| `semantic-success` | #10b981 | Success states, positive actions |
| `semantic-warning` | #f59e0b | Warning states, caution actions |
| `semantic-error` | #ef4444 | Error states, destructive actions |
| `semantic-info` | #3b82f6 | Informational states, links |

## Typography

### Font Family

**System font stack** for maximum performance and native feel:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif;
```

Monospace for code blocks:
```css
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Type Scale

| Token | Size | Use |
|-------|------|-----|
| `xs` | 0.75rem / 12px | Captions, badges |
| `sm` | 0.875rem / 14px | Body small, buttons |
| `base` | 1rem / 16px | Default body |
| `lg` | 1.125rem / 18px | Lead text |
| `xl` | 1.25rem / 20px | Subheadings |
| `2xl` | 1.5rem / 24px | Section titles |
| `3xl` | 1.875rem / 30px | Page titles |

### Principles

- **Body line-height**: 1.5 for readability
- **Display line-height**: 1.2 for large headlines
- **Letter-spacing**: Normal (no tracking on body)
- **Font-weight**: 400 normal, 500 medium, 600 semibold, 700 bold

## Border Radius

Sub2api uses **rounded-xl (12px)** as default for most components, not the sharper Element Plus defaults.

| Token | Value | Use |
|-------|-------|-----|
| `none` | 0px | Never used — sharp corners are deprecated |
| `sm` | 4px | Small badges only |
| `DEFAULT` | 8px | Inputs, small buttons |
| `md` | 8px | Same as default |
| `lg` | 12px | Cards, modals |
| `xl` | 16px | Large cards, dialogs |
| `2xl` | 24px | Hero cards, major containers |
| `full` | 9999px | Pills, avatars |

**Element Plus Override:** Apply `border-radius-lg` class or use CSS override:
```scss
.el-button, .el-card, .el-input__wrapper {
  border-radius: var(--el-border-radius-round, 12px);
}
```

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `glass` | `0 8px 32px rgba(0, 0, 0, 0.08)` | Glass panels, floating elements |
| `glass-sm` | `0 4px 16px rgba(0, 0, 0, 0.06)` | Smaller glass elements |
| `card` | `0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)` | Default card shadow |
| `card-hover` | `0 10px 40px rgba(0, 0, 0, 0.08)` | Hovered cards |
| `inner-glow` | `inset 0 1px 0 rgba(255, 255, 255, 0.1)` | Inset highlights |

## Animations

| Name | Duration | Easing | Use |
|------|----------|--------|-----|
| `fade-in` | 300ms | ease-out | Modal enter, initial load |
| `slide-up` | 300ms | ease-out | Dropdown, tooltip |
| `slide-down` | 300ms | ease-out | Dropdown reverse |
| `slide-in-right` | 300ms | ease-out | Toast notifications |
| `scale-in` | 200ms | ease-out | Dialogs, popovers |

**Element Plus Transition Override:**
```scss
.el-dialog, .el-drawer {
  animation: scale-in 0.2s ease-out;
}

.el-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

## Components

### Buttons

**Primary Button** — Teal gradient CTA
```vue
<el-button type="primary" class="btn btn-primary">
  Primary Action
</el-button>
```

**Secondary Button** — White with border
```vue
<el-button class="btn btn-secondary">
  Secondary
</el-button>
```

**Ghost Button** — Text only
```vue
<el-button class="btn btn-ghost">
  Ghost
</el-button>
```

**Danger Button** — Red gradient
```vue
<el-button class="btn btn-danger">
  Delete
</el-button>
```

**Button Sizes:**
- `.btn-sm` — rounded-lg, 12px vertical padding
- `.btn` (default) — rounded-xl, 10px vertical padding
- `.btn-lg` — rounded-2xl, 12px vertical padding
- `.btn-icon` — square, 10px padding

### Form Inputs

**Standard Input:**
```vue
<el-input class="input" placeholder="Enter value" />
```

**Input with Error:**
```vue
<el-input class="input input-error" placeholder="Invalid" />
```

**Input Group with Label:**
```html
<label class="input-label">Email</label>
<el-input class="input" placeholder="your@email.com" />
<span class="input-hint">We'll never share your email</span>
```

### Cards

**Standard Card:**
```vue
<el-card class="card" :body-style="{ padding: '24px' }">
  <template #header>
    <div class="card-header">Card Title</div>
  </template>
  <div class="card-body">
    Card content goes here
  </div>
</el-card>
```

**Hoverable Card:**
```vue
<el-card class="card card-hover">
  Hover me
</el-card>
```

**Glass Card:**
```vue
<div class="card card-glass">
  Frosted glass effect
</div>
```

**Stat Card:**
```vue
<div class="stat-card">
  <div class="stat-icon stat-icon-primary">
    <Icon />
  </div>
  <div>
    <div class="stat-value">1,234</div>
    <div class="stat-label">Total Users</div>
  </div>
</div>
```

### Tables

**Table Container:**
```vue
<div class="table-container">
  <el-table class="table" :data="data">
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="status" label="Status">
      <template #default="{ row }">
        <span class="badge badge-success">{{ row.status }}</span>
      </template>
    </el-table-column>
  </el-table>
</div>
```

### Badges

```vue
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Inactive</span>
<span class="badge badge-gray">Draft</span>
```

### Modals & Dialogs

**Standard Dialog:**
```vue
<el-dialog
  class="modal-content"
  title="Confirm Action"
  width="500px"
>
  <div class="modal-body">
    Are you sure?
  </div>
  <template #footer>
    <div class="modal-footer">
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="confirm">Confirm</el-button>
    </div>
  </template>
</el-dialog>
```

### Sidebar Navigation

**Sidebar Structure:**
```vue
<aside class="sidebar">
  <div class="sidebar-header">
    <AppLogo />
  </div>
  <nav class="sidebar-nav">
    <div class="sidebar-section">
      <div class="sidebar-section-title">Main</div>
      <router-link class="sidebar-link" to="/">
        <HomeIcon />
        <span>Dashboard</span>
      </router-link>
      <router-link class="sidebar-link sidebar-link-active" to="/orders">
        <OrdersIcon />
        <span>Work Orders</span>
      </router-link>
    </div>
  </nav>
</aside>
```

### Toast Notifications

```vue
<el-message
  class="toast"
  type="success"
  message="Operation completed"
/>
```

Add custom CSS for left border accent:
```scss
.el-message {
  &.toast-success { border-left-color: #10b981; }
  &.toast-error { border-left-color: #ef4444; }
  &.toast-warning { border-left-color: #f59e0b; }
}
```

## Layout Patterns

### AppLayout

Standard admin layout with sidebar + header + main content:

```
┌─────────────────────────────────────────────┐
│ AppSidebar │ AppHeader                      │
│  (w-64)    │                          ┌────┤
│            │                          │Main│
│            │                          │    │
│            │                          └────┤
└─────────────────────────────────────────────┘
```

### TablePageLayout

Standard list page with filters + table + pagination:

```
┌─────────────────────────────────────────────┐
│ PageHeader (title + description)            │
├─────────────────────────────────────────────┤
│ FilterBar (search + filters + actions)       │
├─────────────────────────────────────────────┤
│ TableContainer                              │
│   ┌─────────────────────────────────────┐   │
│   │ DataTable                            │   │
│   │                                     │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ Pagination                                  │
└─────────────────────────────────────────────┘
```

## Element Plus Overrides

To achieve sub2api's aesthetic with Element Plus, add these CSS overrides:

```scss
// Global Element Plus overrides
:root {
  --el-color-primary: #14b8a6;
  --el-color-primary-light-3: #5eead4;
  --el-color-primary-light-5: #99f6e4;
  --el-color-primary-light-7: #ccfbf1;
  --el-color-primary-light-8: #f0fdfa;
  --el-color-primary-light-9: #f0fdfa;
  --el-color-primary-dark-2: #0d9488;

  --el-border-radius-base: 12px;
  --el-border-radius-small: 8px;
  --el-border-radius-round: 9999px;

  --el-shadow-light: 0 8px 32px rgba(0, 0, 0, 0.08);
  --el-shadow-lighter: 0 4px 16px rgba(0, 0, 0, 0.06);
}

// Button overrides
.el-button {
  border-radius: 12px;

  &--primary {
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    border-color: transparent;
  }
}

// Card overrides
.el-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

// Input overrides
.el-input__wrapper {
  border-radius: 12px;
}

// Dialog overrides
.el-dialog {
  border-radius: 16px;
}

// Dark mode
.dark {
  --el-color-primary: #2dd4bf;
  --el-bg-color: #0f172a;
  --el-bg-color-overlay: #1e293b;
  --el-border-color: #334155;
}
```

## Dark Mode

Enable dark mode by adding `class="dark"` to root element:

```vue
<div :class="{ dark: isDarkMode }">
  <!-- app content -->
</div>
```

Dark mode palette is automatically applied via `dark:` prefixed selectors.

## Do's and Don'ts

### Do

- Use `primary-500` (#14b8a6) for primary CTAs, links, and accents
- Apply `rounded-xl` (12px) to cards, buttons, inputs
- Use `glass` shadow for floating panels and modals
- Apply `card-hover` for interactive cards
- Use `backdrop-blur-xl` on overlay surfaces
- Use semantic colors for badges (success/warning/error/info)
- Follow the `stat-card` pattern for dashboard metrics

### Don't

- Don't use `rounded-none` — sharp corners are deprecated
- Don't use `primary-300` or brighter for text — too light
- Don't add `border-radius-small` (4px) to cards — use 12px instead
- Don't use Element Plus default shadows — use custom glass/card shadows
- Don't use hardcoded color values — use design tokens
- Don't mix border styles — all cards use `border-gray-100` or `border-dark-700`

## Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Default desktop |
| `2xl` | 1536px | Large desktop |

**Sidebar collapses to hamburger menu below `lg` breakpoint.**

## File Structure

```
src/
├── assets/
│   └── styles/
│       ├── variables.scss      # Design tokens
│       └── overrides.scss     # Element Plus overrides
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   └── TablePageLayout.vue
│   └── common/
│       ├── StatCard.vue
│       ├── EmptyState.vue
│       └── ...
```

## Implementation Notes

1. **Element Plus Theme**: Configure via `element-plus/theme-chalk` and CSS variables
2. **TailwindCSS**: Not used — custom SCSS with design tokens instead (sub2api uses Tailwind but we adapt to Element Plus)
3. **Dark Mode**: Via `.dark` class on root element, controlled by Pinia store
4. **Icons**: @element-plus/icons-vue + custom SVG icons
5. **Animations**: CSS keyframes defined in `variables.scss`