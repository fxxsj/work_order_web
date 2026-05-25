import type { RouteRecordRaw } from 'vue-router'

const SalesOrderList = () => import('@/views/sales/SalesList.vue')
const SalesForm = () => import('@/views/sales/SalesForm.vue')
const SalesDetail = () => import('@/views/sales/SalesDetail.vue')

export const salesRoutes: RouteRecordRaw[] = [
  {
    path: 'sales-orders',
    name: 'SalesOrderList',
    component: SalesOrderList,
    meta: { title: '客户订单管理', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
  },
  {
    path: 'sales-orders/create',
    name: 'SalesOrderCreate',
    component: SalesForm,
    meta: { title: '新建客户订单', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
  },
  {
    path: 'sales-orders/:id',
    name: 'SalesOrderDetail',
    component: SalesDetail,
    meta: { title: '客户订单详情', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
  },
  {
    path: 'sales-orders/:id/edit',
    name: 'SalesOrderEdit',
    component: SalesForm,
    meta: { title: '编辑客户订单', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
  }
]
