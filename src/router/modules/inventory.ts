import type { RouteRecordRaw } from 'vue-router'

const StockList = () => import('@/views/inventory/Stock.vue')
const DeliveryList = () => import('@/views/inventory/Delivery.vue')
const DeliveryForm = () => import('@/views/inventory/DeliveryForm.vue')
const QualityList = () => import('@/views/inventory/Quality.vue')
const StockInList = () => import('@/views/inventory/StockIn.vue')
const StockOutList = () => import('@/views/inventory/StockOut.vue')

export const inventoryRoutes: RouteRecordRaw[] = [
  {
    path: 'inventory/stocks',
    name: 'StockList',
    component: StockList,
    meta: { title: '成品库存', requiresAuth: true, requiresPermission: ['workorder.view_productstock'] }
  },
  {
    path: 'inventory/delivery',
    name: 'DeliveryList',
    component: DeliveryList,
    meta: { title: '发货管理', requiresAuth: true, requiresPermission: ['workorder.view_deliveryorder'] }
  },
  {
    path: 'inventory/delivery/create',
    name: 'DeliveryCreate',
    component: DeliveryForm,
    meta: { title: '新建发货单', requiresAuth: true, requiresPermission: ['workorder.add_deliveryorder'] }
  },
  {
    path: 'inventory/delivery/:id/edit',
    name: 'DeliveryEdit',
    component: DeliveryForm,
    meta: { title: '编辑发货单', requiresAuth: true, requiresPermission: ['workorder.change_deliveryorder'] }
  },
  {
    path: 'inventory/quality',
    name: 'QualityList',
    component: QualityList,
    meta: { title: '质量检验', requiresAuth: true, requiresPermission: ['workorder.view_qualityinspection'] }
  },
  {
    path: 'inventory/stock-ins',
    name: 'StockInList',
    component: StockInList,
    meta: { title: '入库管理', requiresAuth: true, requiresPermission: ['workorder.view_stockin'] }
  },
  {
    path: 'inventory/stock-outs',
    name: 'StockOutList',
    component: StockOutList,
    meta: { title: '出库管理', requiresAuth: true, requiresPermission: ['workorder.view_stockout'] }
  }
]
