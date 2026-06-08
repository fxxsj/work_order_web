import type { RouteRecordRaw } from 'vue-router'

const TaskList = () => import('@/views/task/TaskList.vue')
const OperatorCenter = () => import('@/views/task/OperatorCenter.vue')
const SupervisorDashboard = () => import('@/views/task/SupervisorDashboard.vue')
const AssignmentRule = () => import('@/views/task/AssignmentRule.vue')

export const taskRoutes: RouteRecordRaw[] = [
  {
    path: 'tasks',
    name: 'TaskList',
    component: TaskList,
    meta: { title: '任务管理', requiresAuth: true, requiresPermission: ['workorder.view_workordertask'] }
  },
  {
    path: 'tasks/operator',
    name: 'OperatorCenter',
    component: OperatorCenter,
    meta: { title: '操作员任务中心', requiresAuth: true, requiresPermission: ['workorder.view_workordertask'] }
  },
  {
    path: 'tasks/supervisor',
    name: 'SupervisorDashboard',
    component: SupervisorDashboard,
    meta: { title: '主管看板', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_workordertask'] }
  },
  {
    path: 'tasks/assignment-rules',
    name: 'AssignmentRule',
    component: AssignmentRule,
    meta: { title: '默认分派部门', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_taskassignmentrule'] }
  }
]
