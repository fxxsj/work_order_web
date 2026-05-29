import type { RouteRecordRaw } from 'vue-router'

const WorkOrderList = () => import('@/views/workorder/WorkOrderList.vue')
const WorkOrderForm = () => import('@/views/workorder/WorkOrderForm.vue')
const WorkOrderDetail = () => import('@/views/workorder/WorkOrderDetail.vue')

export const workorderRoutes: RouteRecordRaw[] = [
  {
    path: 'workorders',
    name: 'WorkOrderList',
    component: WorkOrderList,
    meta: { title: '施工单列表', requiresAuth: true, requiresPermission: ['workorder.view_workorder'] }
  },
  {
    path: 'workorders/create',
    name: 'WorkOrderCreate',
    component: WorkOrderForm,
    meta: { title: '新建施工单', requiresAuth: true, requiresPermission: ['workorder.add_workorder'] }
  },
  {
    path: 'workorders/:id',
    name: 'WorkOrderDetail',
    component: WorkOrderDetail,
    meta: { title: '施工单详情', requiresAuth: true, requiresPermission: ['workorder.view_workorder'] }
  },
  {
    path: 'workorders/:id/edit',
    name: 'WorkOrderEdit',
    component: WorkOrderForm,
    props: true,
    meta: { title: '编辑施工单', requiresAuth: true, requiresPermission: ['workorder.change_workorder'] }
  }
]
