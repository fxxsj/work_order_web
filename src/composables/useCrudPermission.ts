import { computed } from 'vue'
import { usePermission } from './usePermission'

/**
 * CRUD 权限检查 composable
 *
 * @param resource - Django 模型资源名（如 'customer'、'die'）
 * @returns {{ canCreate, canEdit, canDelete, canView }}
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useCrudPermission('customer')
 * // 等价于分别检查 workorder.add_customer / change_customer / delete_customer
 */
export function useCrudPermission(resource: string) {
  const { hasPermission } = usePermission()

  const canCreate = computed(() => hasPermission(`workorder.add_${resource}`))
  const canEdit = computed(() => hasPermission(`workorder.change_${resource}`))
  const canDelete = computed(() => hasPermission(`workorder.delete_${resource}`))
  const canView = computed(() => hasPermission(`workorder.view_${resource}`))

  return { canCreate, canEdit, canDelete, canView }
}
