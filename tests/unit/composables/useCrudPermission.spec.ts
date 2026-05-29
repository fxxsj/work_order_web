import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useCrudPermission } from '@/composables/useCrudPermission'
import { useUserStore } from '@/stores/user'

describe('useCrudPermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('builds standard Django CRUD permission codenames', () => {
    const store = useUserStore()
    store.setUser({
      id: 1,
      username: 'product_manager',
      permissions: ['workorder.add_product', 'workorder.change_product'],
    })

    const { canCreate, canEdit, canDelete, canView } = useCrudPermission('product')

    expect(canCreate.value).toBe(true)
    expect(canEdit.value).toBe(true)
    expect(canDelete.value).toBe(false)
    expect(canView.value).toBe(false)
  })

  it('supports exact model permission resource names', () => {
    const store = useUserStore()
    store.setUser({
      id: 1,
      username: 'supervisor',
      permissions: [
        'workorder.add_taskassignmentrule',
        'workorder.change_taskassignmentrule',
        'workorder.view_taskassignmentrule',
      ],
    })

    const { canCreate, canEdit, canDelete, canView } = useCrudPermission('taskassignmentrule')

    expect(canCreate.value).toBe(true)
    expect(canEdit.value).toBe(true)
    expect(canDelete.value).toBe(false)
    expect(canView.value).toBe(true)
  })
})
