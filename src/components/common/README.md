# Common Components Contract

This directory contains shared UI primitives used by page-level views. New code should prefer the components marked `preferred` in `index.ts`; legacy exports remain available for existing pages during migration.

## TablePageLayout

Responsibility: owns the route-level table page frame and separates fixed action/filter/pagination regions from the scrollable table region.

Slots:

- `actions`: top-right or full-width command area. Use icon buttons for refresh and primary create actions.
- `filters`: search, select filters, date ranges, and quick toggles.
- `table`: the main `DataTable` or equivalent table content.
- `pagination`: the page footer pagination control.

Rules:

- Use on list pages with filtering, table content, and pagination.
- Keep data loading and feature state in the route view or composables, not in this layout.
- Import through `@/components/common` for now. If the file moves to `components/layout`, keep the common barrel export.

## DataTable

Responsibility: renders the standard data table, including desktop sticky headers/columns, mobile card rendering, loading rows, empty state, and optional virtual scrolling.

Required props:

- `columns: Column[]`
- `data: any[]`

Common optional props:

- `loading`
- `rowKey`
- `stickyFirstColumn`
- `stickyActionsColumn`
- `defaultSortKey`
- `defaultSortOrder`
- `sortStorageKey`
- `serverSideSort`
- `estimateRowHeight`
- `overscan`

Slots:

- `header-[key]`: custom header rendering.
- `cell-[key]`: custom cell rendering. Receives `{ row, value, expanded }`.
- `empty`: custom empty state.

Events:

- `sort(key, order)`: emitted when `serverSideSort` is enabled and the user changes sort state.

Rules:

- Use for route-level list tables and any table needing sorting, loading, empty state, sticky columns, or mobile card behavior.
- Define all columns in script with stable keys; do not derive columns inline in the template.
- Use `rowKey` when rows do not have a stable `id`.
- Native `<table>` is allowed only for print views, read-only detail fragments, tiny dashboard summaries, and low-level table implementations.

## BaseDialog

Responsibility: provides the accessible modal shell, title, body, footer slot, close handling, focus restoration, and body scroll lock.

Props:

- `show: boolean`
- `title: string`
- `width?: 'narrow' | 'normal' | 'wide' | 'extra-wide' | 'full'`
- `closeOnEscape?: boolean`
- `closeOnClickOutside?: boolean`
- `zIndex?: number`

Events:

- `close`

Rules:

- Parent owns visibility state.
- Children emit events instead of mutating parent state.
- Form dialogs should place the native `<form>` in the default slot and submit buttons in the `footer` slot using the `form` attribute.

## ConfirmDialog

Responsibility: wraps `BaseDialog` for destructive or high-impact confirmation flows.

Props:

- `show: boolean`
- `title: string`
- `message: string`
- `confirmText?: string`
- `cancelText?: string`
- `loadingText?: string`
- `danger?: boolean`
- `loading?: boolean`

Events:

- `confirm`
- `cancel`

Rules:

- Use instead of command-style `ErrorHandler.confirm()`.
- Keep the pending action in the parent component.
- Pass `loading` while the parent is performing the confirmed action.
- Reset the selected row or action payload after confirm/cancel completes.

## Simple CRUD Dialog State

Preferred state shape:

```ts
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const selectedRow = ref<Entity | null>(null)
```

Avoid shared state such as `dialogVisible + dialogType` in new simple CRUD pages. Existing complex pages may keep that shape until their dedicated migration pass.

## Form Control Contract

Preferred form controls should eventually support:

- `label`
- `hint`
- `error`
- `disabled`

Current status is tracked in `.planning/FORM_CONTROL_CONTRACT_AUDIT.md`. New simple CRUD forms can use the built-in label/hint/error props on the preferred form controls.
