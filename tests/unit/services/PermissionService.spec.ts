/**
 * PermissionService 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import permissionService from '@/services/PermissionService'

describe('PermissionService', () => {
  beforeEach(() => {
    permissionService.reset()
  })

  describe('初始化', () => {
    it('应该正确初始化用户权限', () => {
      const user = {
        id: 1,
        username: 'testuser',
        is_superuser: false,
        groups: [{ name: 'sales' }],
        permissions: ['workorder.view_workorder', 'workorder.add_workorder']
      }

      permissionService.initUser(user)

      expect(permissionService.currentUser).toEqual(user)
      expect(permissionService.userRoles.has('sales')).toBe(true)
      expect(permissionService.userPermissions.has('workorder.view_workorder')).toBe(true)
    })

    it('应该处理空的 groups 和 permissions', () => {
      const user = {
        id: 1,
        username: 'testuser',
        is_superuser: false
      }

      permissionService.initUser(user)

      expect(permissionService.userRoles.size).toBe(0)
      expect(permissionService.userPermissions.size).toBe(0)
    })
  })

  describe('hasRole', () => {
    it('未初始化用户应该返回 false', () => {
      expect(permissionService.hasRole('admin')).toBe(false)
    })

    it('超级用户应该通过所有角色检查', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      expect(permissionService.hasRole('any_role')).toBe(true)
    })

    it('应该正确检查单个角色', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [{ name: 'sales' }],
        permissions: []
      })

      expect(permissionService.hasRole('sales')).toBe(true)
      expect(permissionService.hasRole('admin')).toBe(false)
    })

    it('应该正确检查多个角色', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [{ name: 'sales' }],
        permissions: []
      })

      expect(permissionService.hasRole(['sales', 'admin'])).toBe(true)
      expect(permissionService.hasRole(['manager', 'admin'])).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('未初始化用户应该返回 false', () => {
      expect(permissionService.hasPermission('workorder.view_workorder')).toBe(false)
    })

    it('超级用户应该通过所有权限检查', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      expect(permissionService.hasPermission('any.permission')).toBe(true)
    })

    it('应该正确检查单个权限', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.view_workorder']
      })

      expect(permissionService.hasPermission('workorder.view_workorder')).toBe(true)
      expect(permissionService.hasPermission('workorder.delete_workorder')).toBe(false)
    })

    it('应该正确检查多个权限', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.view_workorder']
      })

      expect(permissionService.hasPermission(['workorder.view_workorder', 'workorder.add_workorder'])).toBe(true)
    })
  })

  describe('canViewWorkOrder', () => {
    it('未初始化用户应该返回 false', () => {
      const workOrder = { id: 1 }
      expect(permissionService.canViewWorkOrder(workOrder)).toBe(false)
    })

    it('超级用户应该可以查看所有施工单', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      const workOrder = { id: 1 }
      expect(permissionService.canViewWorkOrder(workOrder)).toBe(true)
    })

    it('创建者应该可以查看自己的施工单', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: []
      })

      const workOrder = {
        id: 1,
        created_by: { id: 1 }
      }

      expect(permissionService.canViewWorkOrder(workOrder)).toBe(true)
    })

    it('销售人员应该可以查看自己客户的施工单', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [{ name: 'sales' }],
        permissions: []
      })

      const workOrder = {
        id: 1,
        customer: { salesperson: { id: 1 } },
        created_by: { id: 2 }
      }

      expect(permissionService.canViewWorkOrder(workOrder)).toBe(true)
    })
  })

  describe('canEditWorkOrder', () => {
    it('应该检查是否有编辑权限', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_workorder']
      })

      // 用户是创建者，编辑权限检查需要先能查看
      const workOrder = {
        id: 1,
        approval_status: 'pending',
        created_by: { id: 1 }
      }

      expect(permissionService.canEditWorkOrder(workOrder)).toBe(true)
    })

    it('已批准的施工单需要特殊权限', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_workorder']
      })

      const workOrder = {
        id: 1,
        approval_status: 'approved',
        created_by: { id: 1 }
      }

      expect(permissionService.canEditWorkOrder(workOrder)).toBe(false)
    })
  })

  describe('canDeleteWorkOrder', () => {
    it('待处理状态的施工单可以删除', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.delete_workorder']
      })

      const workOrder = {
        id: 1,
        status: 'pending',
        approval_status: 'pending'
      }

      expect(permissionService.canDeleteWorkOrder(workOrder)).toBe(true)
    })

    it('已批准的施工单不能删除', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.delete_workorder']
      })

      const workOrder = {
        id: 1,
        status: 'pending',
        approval_status: 'approved'
      }

      expect(permissionService.canDeleteWorkOrder(workOrder)).toBe(false)
    })

    it('进行中的施工单不能删除', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.delete_workorder']
      })

      const workOrder = {
        id: 1,
        status: 'in_progress',
        approval_status: 'pending'
      }

      expect(permissionService.canDeleteWorkOrder(workOrder)).toBe(false)
    })
  })

  describe('canOperateTask', () => {
    beforeEach(() => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [{ name: 'operator' }],
        permissions: ['workorder.change_workordertask']
      })
    })

    it('任务负责人可以操作任务', () => {
      const task = {
        id: 1,
        assigned_operator: { id: 1 },
        status: 'pending'
      }

      expect(permissionService.canOperateTask(task, 'view')).toBe(true)
      expect(permissionService.canOperateTask(task, 'update')).toBe(true)
    })

    it('未分配的任务负责人不能操作', () => {
      const task = {
        id: 1,
        assigned_operator: { id: 2 },
        status: 'pending'
      }

      expect(permissionService.canOperateTask(task, 'view')).toBe(false)
    })

    it('assign 操作需要特定权限', () => {
      const task = { id: 1 }

      expect(permissionService.canOperateTask(task, 'assign')).toBe(true)
    })
  })

  describe('getEditableFields', () => {
    it('已批准施工单返回受限字段（无特殊权限时）', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_workorder']
      })

      const workOrder = { approval_status: 'approved' }
      const fields = permissionService.getEditableFields(workOrder)

      // 无 change_approved_workorder 权限时，只能编辑受限字段
      expect(fields).toContain('notes')
      expect(fields).toContain('delivery_date')
    })

    it('已批准施工单全部可编辑（有特殊权限时）', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_approved_workorder']
      })

      const workOrder = { approval_status: 'approved' }
      const fields = permissionService.getEditableFields(workOrder)

      // 有 change_approved_workorder 权限时，所有字段可编辑（返回空数组）
      expect(fields).toHaveLength(0)
    })

    it('未批准施工单返回全部字段', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_workorder']
      })

      const workOrder = { approval_status: 'pending' }
      const fields = permissionService.getEditableFields(workOrder)

      expect(fields).toContain('customer')
      expect(fields).toContain('production_quantity')
    })
  })

  describe('isFieldEditable', () => {
    it('应该正确判断字段是否可编辑', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.change_workorder']
      })

      const workOrder = { approval_status: 'pending' }

      expect(permissionService.isFieldEditable(workOrder, 'customer')).toBe(true)
      expect(permissionService.isFieldEditable(workOrder, 'notes')).toBe(true)
    })
  })

  describe('filterWorkOrders', () => {
    it('超级用户应该返回所有施工单', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      const workOrders = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const filtered = permissionService.filterWorkOrders(workOrders)

      expect(filtered).toHaveLength(3)
    })

    it('普通用户只返回有权限的施工单', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: []
      })

      const workOrders = [
        { id: 1, created_by: { id: 1 } },
        { id: 2, created_by: { id: 2 } }
      ]

      const filtered = permissionService.filterWorkOrders(workOrders)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })
  })

  describe('filterTasks', () => {
    it('超级用户应该返回所有任务', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      const tasks = [{ id: 1 }, { id: 2 }]
      const filtered = permissionService.filterTasks(tasks)

      expect(filtered).toHaveLength(2)
    })
  })

  describe('canAccessMenu', () => {
    beforeEach(() => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.view_workorder']
      })
    })

    it('应该检查菜单权限', () => {
      expect(permissionService.canAccessMenu('/workorders')).toBe(true)
      expect(permissionService.canAccessMenu('/tasks')).toBe(false)
    })

    it('未知路径（无权限要求）应该返回 true', () => {
      // 未知路径没有权限要求，也没有角色要求，默认返回 true
      expect(permissionService.canAccessMenu('/unknown')).toBe(true)
    })
  })

  describe('canExport', () => {
    it('超级用户可以导出所有类型', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [],
        permissions: []
      })

      expect(permissionService.canExport('workorder')).toBe(true)
      expect(permissionService.canExport('task')).toBe(true)
    })

    it('普通用户需要相应权限', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: false,
        groups: [],
        permissions: ['workorder.view_workorder']
      })

      expect(permissionService.canExport('workorder')).toBe(true)
      expect(permissionService.canExport('task')).toBe(false)
    })
  })

  describe('getUserSummary', () => {
    it('未登录用户返回空摘要', () => {
      const summary = permissionService.getUserSummary()

      expect(summary.isAuthenticated).toBe(false)
      expect(summary.roles).toHaveLength(0)
      expect(summary.permissions).toHaveLength(0)
    })

    it('已登录用户返回完整摘要', () => {
      permissionService.initUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_superuser: false,
        groups: [{ name: 'sales' }],
        permissions: ['workorder.view_workorder']
      })

      const summary = permissionService.getUserSummary()

      expect(summary.isAuthenticated).toBe(true)
      expect(summary.id).toBe(1)
      expect(summary.username).toBe('testuser')
      expect(summary.roles).toContain('sales')
      expect(summary.permissions).toContain('workorder.view_workorder')
    })
  })

  describe('reset', () => {
    it('应该重置所有状态', () => {
      permissionService.initUser({
        id: 1,
        is_superuser: true,
        groups: [{ name: 'admin' }],
        permissions: ['admin.all']
      })

      permissionService.reset()

      expect(permissionService.currentUser).toBeNull()
      expect(permissionService.userRoles.size).toBe(0)
      expect(permissionService.userPermissions.size).toBe(0)
    })
  })
})
