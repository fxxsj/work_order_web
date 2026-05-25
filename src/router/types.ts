/**
 * Vue Router Meta 类型扩展
 * 为所有路由提供统一的 meta 字段类型约束
 */

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题，用于 document.title */
    title?: string
    /** 是否需要认证，默认为 true */
    requiresAuth?: boolean
    /** 是否需要管理员权限 */
    requiresAdmin?: boolean
    /** 需要的特定权限（单个或数组） */
    requiresPermission?: string | string[]
    /** 面包屑路径 */
    breadcrumb?: string[]
    /** 页面描述 */
    description?: string
  }
}

export {}
