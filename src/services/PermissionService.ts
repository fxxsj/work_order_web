/**
 * 权限检查服务
 *
 * 提供统一的权限检查逻辑，避免在各个组件中重复编写权限代码
 */

export interface MenuItem {
  path?: string
  roles?: string[]
  permission?: string
}

export interface UserSummary {
  isAuthenticated: boolean
  id?: number
  username?: string
  email?: string
  isSuperuser?: boolean
  roles: string[]
  permissions: string[]
}

class PermissionService {
  userPermissions: Set<string>
  userRoles: Set<string>
  currentUser: Record<string, unknown> | null

  constructor() {
    this.userPermissions = new Set()
    this.userRoles = new Set()
    this.currentUser = null
  }

  initUser(user: Record<string, unknown>): void {
    this.currentUser = user

    const groups = user.groups as Array<{ name: string }> | undefined
    if (groups && Array.isArray(groups)) {
      this.userRoles = new Set(groups.map(g => g.name))
    }

    const permissions = user.permissions as string[] | undefined
    if (permissions && Array.isArray(permissions)) {
      this.userPermissions = new Set(permissions)
    }
  }

  hasRole(roles: string | string[]): boolean {
    if (!this.currentUser) {
      return false
    }

    if (this.currentUser.is_superuser) {
      return true
    }

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.some((role: any) => this.userRoles.has(role))
  }

  hasPermission(permissions: string | string[]): boolean {
    if (!this.currentUser) {
      return false
    }

    if (this.currentUser.is_superuser) {
      return true
    }

    const permArray = Array.isArray(permissions) ? permissions : [permissions]
    return permArray.some(perm => this.userPermissions.has(perm))
  }

  canViewWorkOrder(workOrder: Record<string, unknown>): boolean {
    if (!this.currentUser) {
      return false
    }

    if (this.currentUser.is_superuser) {
      return true
    }

    const customer = workOrder.customer as Record<string, unknown> | undefined
    const salesperson = customer?.salesperson as Record<string, unknown> | undefined
    const createdBy = workOrder.created_by as Record<string, unknown> | undefined
    const currentUserId = this.currentUser.id as number

    if (this.hasRole('sales')) {
      return (salesperson?.id === currentUserId) || (createdBy?.id === currentUserId)
    }

    if (this.hasRole('supervisor') && this.hasPermission('workorder.view_workorder')) {
      return this.canViewDepartmentWorkOrder(workOrder)
    }

    return createdBy?.id === currentUserId
  }

  canViewDepartmentWorkOrder(workOrder: Record<string, unknown>): boolean {
    if (!this.currentUser) {
      return false
    }

    const profile = this.currentUser.profile as Record<string, unknown> | undefined
    const userDepartments = (profile?.departments as Array<{ id: number }>) || []

    const orderProcesses = workOrder.order_processes as Array<{
      tasks?: Array<{ assigned_department?: number }>
    }> | undefined

    if (!orderProcesses) return false

    return orderProcesses.some((process: any) =>
      process.tasks?.some((task: any) =>
        userDepartments.some((dept: any) => dept.id === task.assigned_department)
      )
    )
  }

  canEditWorkOrder(workOrder: Record<string, unknown>): boolean {
    if (!this.canViewWorkOrder(workOrder)) {
      return false
    }

    if (workOrder.approval_status === 'approved') {
      return this.hasPermission('workorder.change_approved_workorder')
    }

    return this.hasPermission('workorder.change_workorder')
  }

  canDeleteWorkOrder(workOrder: Record<string, unknown>): boolean {
    if (workOrder.status !== 'pending') {
      return false
    }

    if (workOrder.approval_status === 'approved') {
      return false
    }

    return this.hasPermission('workorder.delete_workorder')
  }

  canApproveWorkOrder(workOrder: Record<string, unknown>): boolean {
    if (this.currentUser?.is_superuser) {
      return true
    }

    if (!this.hasPermission('workorder.approve_workorder')) {
      return false
    }

    if (this.hasRole('sales')) {
      const customer = workOrder.customer as Record<string, unknown> | undefined
      const salesperson = customer?.salesperson as Record<string, unknown> | undefined
      return salesperson?.id === this.currentUser?.id
    }

    return true
  }

  canOperateTask(task: Record<string, unknown>, action: 'view' | 'update' | 'complete' | 'assign' = 'view'): boolean {
    if (!this.currentUser) {
      return false
    }

    const assignedOperator = task.assigned_operator as Record<string, unknown> | number | undefined
    const assignedOperatorId = typeof assignedOperator === 'object'
      ? (assignedOperator?.id as number)
      : assignedOperator as number

    const currentUserId = this.currentUser.id as number

    if (this.currentUser.is_superuser) {
      return true
    }

    if (action === 'view') {
      if (assignedOperatorId === currentUserId) {
        return true
      }

      if (this.hasRole('supervisor') && task.assigned_department) {
        const profile = this.currentUser.profile as Record<string, unknown> | undefined
        const userDepartments = (profile?.departments as Array<{ id: number }>) || []
        return userDepartments.some((dept: any) => dept.id === task.assigned_department)
      }

      const workOrderProcess = task.work_order_process as Record<string, unknown> | undefined
      const wo = workOrderProcess?.work_order as Record<string, unknown> | undefined
      const createdBy = wo?.created_by as Record<string, unknown> | undefined
      if (createdBy?.id === currentUserId) {
        return true
      }

      return false
    }

    if (action === 'update' || action === 'complete') {
      if (assignedOperatorId === currentUserId) {
        return true
      }

      if (this.hasRole('supervisor') && this.hasPermission('workorder.change_workordertask')) {
        if (task.assigned_department) {
          const profile = this.currentUser.profile as Record<string, unknown> | undefined
          const userDepartments = (profile?.departments as Array<{ id: number }>) || []
          return userDepartments.some((dept: any) => dept.id === task.assigned_department)
        }
      }

      const workOrderProcess = task.work_order_process as Record<string, unknown> | undefined
      const wo = workOrderProcess?.work_order as Record<string, unknown> | undefined
      const createdBy = wo?.created_by as Record<string, unknown> | undefined
      if (createdBy?.id === currentUserId) {
        return true
      }

      return false
    }

    if (action === 'assign') {
      return this.hasPermission('workorder.change_workordertask')
    }

    return false
  }

  getEditableFields(workOrder: Record<string, unknown>): string[] {
    if (workOrder.approval_status === 'approved') {
      if (this.hasPermission('workorder.change_approved_workorder')) {
        return []
      }
      return ['notes', 'delivery_date', 'actual_delivery_date']
    }

    if (this.hasPermission('workorder.change_workorder')) {
      return [
        'customer',
        'production_quantity',
        'order_date',
        'delivery_date',
        'priority',
        'notes',
        'products_data',
        'processes'
      ]
    }

    return []
  }

  isFieldEditable(workOrder: Record<string, unknown>, field: string): boolean {
    const editableFields = this.getEditableFields(workOrder)

    if (editableFields.length === 0) {
      return true
    }

    return editableFields.includes(field)
  }

  filterWorkOrders(workOrders: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    if (!this.currentUser) {
      return []
    }

    if (this.currentUser.is_superuser) {
      return workOrders
    }

    return workOrders.filter(wo => this.canViewWorkOrder(wo))
  }

  filterTasks(tasks: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    if (!this.currentUser) {
      return []
    }

    if (this.currentUser.is_superuser) {
      return tasks
    }

    return tasks.filter((task: any) => this.canOperateTask(task, 'view'))
  }

  canAccessMenu(menu: MenuItem | string): boolean {
    if (!menu) {
      return false
    }

    if (this.currentUser?.is_superuser) {
      return true
    }

    let menuObj: MenuItem
    if (typeof menu === 'string') {
      const menuPermissionMap: Record<string, string> = {
        '/workorders': 'workorder.view_workorder',
        '/tasks': 'workorder.view_workordertask',
        '/customers': 'workorder.view_customer',
        '/products': 'workorder.view_product',
        '/materials': 'workorder.view_material',
        '/artworks': 'workorder.view_artwork',
        '/reports': 'workorder.view_workorder',
        '/settings': 'workorder.view_workorder',
        '/admin': 'auth.change_group'
      }

      menuObj = {
        path: menu,
        permission: menuPermissionMap[menu]
      }
    } else {
      menuObj = menu
    }

    if (menuObj.roles && menuObj.roles.length > 0) {
      if (!this.hasRole(menuObj.roles)) {
        return false
      }
    }

    if (menuObj.permission) {
      if (!this.hasPermission(menuObj.permission)) {
        return false
      }
    }

    return true
  }

  canExport(dataType: string): boolean {
    if (this.currentUser?.is_superuser) {
      return true
    }

    const exportPermissionMap: Record<string, string> = {
      workorder: 'workorder.view_workorder',
      task: 'workorder.view_workordertask',
      customer: 'workorder.view_customer'
    }

    if (exportPermissionMap[dataType] && this.hasPermission(exportPermissionMap[dataType])) {
      return true
    }

    const viewPermissionMap: Record<string, string> = {
      workorder: 'workorder.view_workorder',
      task: 'workorder.view_workordertask',
      customer: 'workorder.view_customer'
    }

    return this.hasPermission(viewPermissionMap[dataType] || 'workorder.view_workorder')
  }

  getUserSummary(): UserSummary {
    if (!this.currentUser) {
      return {
        isAuthenticated: false,
        roles: [],
        permissions: []
      }
    }

    return {
      isAuthenticated: true,
      id: this.currentUser.id as number,
      username: this.currentUser.username as string,
      email: this.currentUser.email as string,
      isSuperuser: this.currentUser.is_superuser as boolean,
      roles: Array.from(this.userRoles),
      permissions: Array.from(this.userPermissions)
    }
  }

  reset(): void {
    this.userPermissions.clear()
    this.userRoles.clear()
    this.currentUser = null
  }
}

const permissionService = new PermissionService()

export default permissionService
