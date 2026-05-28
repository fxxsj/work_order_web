/**
 * Common components barrel export.
 *
 * New pages should prefer the SUB2API-aligned exports below. Legacy exports are
 * kept for migrated-in-progress pages and should not be used in new simple CRUD
 * implementations.
 */

// Preferred SUB2API-aligned primitives
export { default as Icon } from '@/components/icons/Icon.vue'
export { default as TablePageLayout } from './TablePageLayout.vue'
export { default as DataTable } from './DataTable.vue'
export { default as Pagination } from './Pagination.vue'
export { default as BaseDialog } from './BaseDialog.vue'
export { default as ConfirmDialog } from './ConfirmDialog.vue'
export { default as RowActions } from './RowActions.vue'
export { default as FilterRow } from './FilterRow.vue'
export { default as SectionDivider } from './SectionDivider.vue'
export { default as DescriptionGrid } from './DescriptionGrid.vue'
export { default as DescriptionItem } from './DescriptionItem.vue'
export { default as SummaryTable } from './SummaryTable.vue'
export { default as LineItemsTable } from './LineItemsTable.vue'
export { default as Input } from './Input.vue'
export { default as Select } from './Select.vue'
export { default as TextArea } from './TextArea.vue'
export { default as Toggle } from './Toggle.vue'
export { default as SearchInput } from './SearchInput.vue'
export { default as InputNumber } from './InputNumber.vue'
export { default as Checkbox } from './Checkbox.vue'
export { default as CheckboxGroup } from './CheckboxGroup.vue'
export { default as Radio } from './Radio.vue'
export { default as RadioGroup } from './RadioGroup.vue'
export { default as RadioButton } from './RadioButton.vue'
export { default as EmptyState } from './EmptyState.vue'
export { default as Skeleton } from './Skeleton.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'
export { default as LoadingOverlay } from './LoadingOverlay.vue'
export { default as Toast } from './Toast.vue'
export { default as GlobalConfirm } from './GlobalConfirm.vue'
export { default as HelpTooltip } from './HelpTooltip.vue'
export { default as ProgressBar } from './ProgressBar.vue'
export { default as Tag } from './Tag.vue'
export { default as Alert } from './Alert.vue'
export { default as CircularProgress } from './CircularProgress.vue'
export { default as DateRangePicker } from './DateRangePicker.vue'
export { default as MonthRangePicker } from './MonthRangePicker.vue'
export { default as StatusTag } from './StatusTag.vue'
export { default as ImageViewer } from './ImageViewer.vue'
export { default as ImageManager } from './ImageManager.vue'

// Legacy migration exports
export { default as DataSelector } from './DataSelector.vue'
export { default as FormDialog } from './FormDialog.vue'
export { default as StatsCards } from './StatsCards.vue'
export { default as BaseSelect } from './BaseSelect.vue'

export type { Column, RowAction, RowActionTone } from './types'
