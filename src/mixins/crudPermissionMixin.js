import permissionMixin from './permissionMixin'

// action 关键词 → Django permission action 前缀
const ACTION_MAP = {
  view: 'view_',
  create: 'add_',
  edit: 'change_',
  delete: 'delete_',
  export: 'view_',
  approve: 'approve_',
  change_status: 'change_',
  assign: 'change_',
  complete: 'change_'
}

const KNOWN_ACTIONS = new Set([
  'view', 'create', 'edit', 'delete',
  'export', 'approve', 'change_status', 'assign', 'complete'
])

// 将权限前缀转为 Django codename 格式，并构建完整权限字符串
// 支持三种格式：
//   'customer.view'      → 使用 action 参数的映射来构建 permission
//   'view_customer'      → 直接用前缀的 action + 参数的 Django 映射
//   'workordertask'      → 使用 action 参数的 Django 映射（纯 model 名）
function buildDjangoPermission(prefix, action) {
  // 格式1: dot 格式 'customer.view' — 前缀的 action 仅为显示，
  // 实际 Django action 由调用方法决定（如 canCreate→create→add_）
  if (prefix.includes('.')) {
    const [model] = prefix.split('.')
    const djangoAction = ACTION_MAP[action] || `${action}_`
    return `workorder.${djangoAction}${model.replace(/-/g, '')}`
  }

  // 格式2: 下划线格式 'view_customer' — 前缀自带 action，
  // 使用前缀的 action，忽略参数 action
  if (prefix.includes('_')) {
    const [act] = prefix.split('_')
    if (KNOWN_ACTIONS.has(act)) {
      // 直接用前缀的 action（不做映射），拼上剩余部分作为 model
      const afterAction = prefix.substring(act.length + 1)
      return `workorder.${act}_${afterAction}`
    }
  }

  // 格式3: 纯 model 名 'workordertask' / 'salesorder'
  const djangoAction = ACTION_MAP[action] || `${action}_`
  return `workorder.${djangoAction}${prefix}`
}

export default {
  mixins: [permissionMixin],

  data() {
    return {
      // 权限前缀，格式为 'model' 或 'action_model' 或 'model.action'
      // 例如 'customer', 'view_customer', 'customer.view' 均支持
      permissionPrefix: ''
    }
  },

  methods: {
    canView() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'view'))
    },

    canCreate() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'create'))
    },

    canEdit(row) {
      if (!this.permissionPrefix) return true
      const hasEditPermission = this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'edit'))
      if (!hasEditPermission) return false
      if (row && this._checkRowEditPermission) {
        return this._checkRowEditPermission(row)
      }
      return true
    },

    canDelete(row) {
      if (!this.permissionPrefix) return true
      const hasDeletePermission = this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'delete'))
      if (!hasDeletePermission) return false
      if (row && this._checkRowDeletePermission) {
        return this._checkRowDeletePermission(row)
      }
      return true
    },

    canExport() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'export'))
    },

    canApprove() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'approve'))
    },

    canChangeStatus() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'change_status'))
    },

    canAssign() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'assign'))
    },

    canComplete() {
      if (!this.permissionPrefix) return true
      return this.hasPermission(buildDjangoPermission(this.permissionPrefix, 'complete'))
    },

    hasAnyOf(...permissions) {
      return this.hasAnyPermission(permissions)
    },

    hasAllOf(...permissions) {
      return this.hasAllPermissions(permissions)
    }
  }
}
