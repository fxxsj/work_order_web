import type { RouteRecordRaw } from 'vue-router'

const SupplierList = () => import('@/views/supplier/SupplierList.vue')
const PurchaseOrderList = () => import('@/views/purchase/PurchaseList.vue')
const PurchaseForm = () => import('@/views/purchase/PurchaseForm.vue')

export const procurementRoutes: RouteRecordRaw[] = [
  {
    path: 'suppliers',
    name: 'SupplierList',
    component: SupplierList,
    meta: { title: '供应商管理', requiresAuth: true, requiresPermission: ['workorder.view_supplier'] }
  },
  {
    path: 'purchase-orders',
    name: 'PurchaseOrderList',
    component: PurchaseOrderList,
    meta: { title: '采购订单管理', requiresAuth: true, requiresPermission: ['workorder.view_purchaseorder'] }
  },
  {
    path: 'purchase-orders/create',
    name: 'PurchaseOrderCreate',
    component: PurchaseForm,
    meta: { title: '新建采购订单', requiresAuth: true, requiresPermission: ['workorder.view_purchaseorder'] }
  }
]
