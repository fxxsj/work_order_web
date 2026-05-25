import type { RouteRecordRaw } from 'vue-router'

const CustomerList = () => import('@/views/customer/CustomerList.vue')
const DepartmentList = () => import('@/views/department/DepartmentList.vue')
const ProcessList = () => import('@/views/process/ProcessList.vue')
const ProcessLogList = () => import('@/views/process/ProcessLog.vue')
const ProductList = () => import('@/views/product/ProductList.vue')
const MaterialList = () => import('@/views/material/MaterialList.vue')
const ProductGroupList = () => import('@/views/product-group/ProductGroupList.vue')

export const masterDataRoutes: RouteRecordRaw[] = [
  {
    path: 'customers',
    name: 'CustomerList',
    component: CustomerList,
    meta: { title: '客户管理', requiresAuth: true, requiresPermission: ['workorder.view_customer'] }
  },
  {
    path: 'departments',
    name: 'DepartmentList',
    component: DepartmentList,
    meta: { title: '部门管理', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_department'] }
  },
  {
    path: 'processes',
    name: 'ProcessList',
    component: ProcessList,
    meta: { title: '工序管理', requiresAuth: true, requiresPermission: ['workorder.view_process'] }
  },
  {
    path: 'process-logs',
    name: 'ProcessLogList',
    component: ProcessLogList,
    meta: { title: '工序日志', requiresAuth: true, requiresPermission: ['workorder.view_processlog'] }
  },
  {
    path: 'products',
    name: 'ProductList',
    component: ProductList,
    meta: { title: '产品管理', requiresAuth: true, requiresPermission: ['workorder.view_product'] }
  },
  {
    path: 'materials',
    name: 'MaterialList',
    component: MaterialList,
    meta: { title: '物料管理', requiresAuth: true, requiresPermission: ['workorder.view_material'] }
  },
  {
    path: 'product-groups',
    name: 'ProductGroupList',
    component: ProductGroupList,
    meta: { title: '产品组管理', requiresAuth: true, requiresPermission: ['workorder.view_productgroup'] }
  }
]
