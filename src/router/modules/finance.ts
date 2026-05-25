import type { RouteRecordRaw } from 'vue-router'

const InvoiceList = () => import('@/views/finance/Invoice.vue')
const PaymentList = () => import('@/views/finance/Payment.vue')
const CostList = () => import('@/views/finance/Cost.vue')
const StatementList = () => import('@/views/finance/Statement.vue')
const CostCenterList = () => import('@/views/finance/CostCenter.vue')
const CostItemList = () => import('@/views/finance/CostItem.vue')
const PaymentPlanList = () => import('@/views/finance/PaymentPlan.vue')

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: 'finance/invoices',
    name: 'InvoiceList',
    component: InvoiceList,
    meta: { title: '发票管理', requiresAuth: true, requiresPermission: ['workorder.view_invoice'] }
  },
  {
    path: 'finance/payments',
    name: 'PaymentList',
    component: PaymentList,
    meta: { title: '收款管理', requiresAuth: true, requiresPermission: ['workorder.view_payment'] }
  },
  {
    path: 'finance/costs',
    name: 'CostList',
    component: CostList,
    meta: { title: '成本核算', requiresAuth: true, requiresPermission: ['workorder.view_productioncost'] }
  },
  {
    path: 'finance/statements',
    name: 'StatementList',
    component: StatementList,
    meta: { title: '对账管理', requiresAuth: true, requiresPermission: ['workorder.view_statement'] }
  },
  {
    path: 'finance/cost-centers',
    name: 'CostCenterList',
    component: CostCenterList,
    meta: { title: '成本中心', requiresAuth: true, requiresPermission: ['workorder.view_costcenter'] }
  },
  {
    path: 'finance/cost-items',
    name: 'CostItemList',
    component: CostItemList,
    meta: { title: '成本项目', requiresAuth: true, requiresPermission: ['workorder.view_costitem'] }
  },
  {
    path: 'finance/payment-plans',
    name: 'PaymentPlanList',
    component: PaymentPlanList,
    meta: { title: '付款计划', requiresAuth: true, requiresPermission: ['workorder.view_paymentplan'] }
  }
]
