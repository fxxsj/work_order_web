# Frontend Reuse Guidelines

## Lists

Use `useCrudList` for paginated pages that load rows from a `getList(params)` API.

- Put simple filters in `initialFilters`.
- Use `searchText` only for the primary full-text search field.
- Use `buildParams` when UI fields differ from API params, for example `date_range` to `start_date` and `end_date`.
- Keep export params derived from `filters.value` so exported data matches the visible filter state.
- Keep page-specific auxiliary data, such as stats and select options, outside `useCrudList`.

## Status Tags

Use `StatusTag` for status, priority, type, and action tags when the mapping is shared.

- Add shared mappings to `src/constants/statusMeta.js`.
- Pass backend display text through `label` when available.
- Avoid local `getStatusType` or `getPriorityType` helpers unless the tag is truly page-specific.

## Stats Cards

Use `StatsCards` for summary metrics instead of duplicating row, column, icon, color, and value formatting markup.

- Pass an `items` array with stable `key`, `label`, `value`, `format`, `icon`, and semantic `tone`.
- Use `layout="media"` when the card needs a colored icon block beside the value.
- Use `span` to control desktop columns and keep the built-in `xs=24` / `sm=12` responsive behavior.
- Prefer global tokens such as `--ui-stat-icon-size` and `--ui-filter-control-width` over hard-coded page values.

## Confirmed Actions

Always check the return value from `ErrorHandler.confirm` before running the action.

```js
const confirmed = await ErrorHandler.confirm('确定执行该操作？')
if (!confirmed) return
await api.doAction(id)
```

For compact helpers, `ErrorHandler.withConfirm` is also available, but do not ignore the cancellation path.
