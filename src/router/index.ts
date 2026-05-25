/**
 * Vue Router Configuration
 * 路由守卫: 认证检查、权限控制、页面标题、Chunk 加载错误处理
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'
import { authAPI } from '@/api/modules'

const SITE_NAME = '印刷施工单跟踪系统'

// ==================== 懒加载组件 ====================

const Login = () => import('@/views/Login.vue')
const AppLayout = () => import('@/components/layout/AppLayout.vue')
const Dashboard = () => import('@/views/Dashboard.vue')

// 施工单管理
const WorkOrderList = () => import('@/views/workorder/WorkOrderList.vue')
const WorkOrderForm = () => import('@/views/workorder/WorkOrderForm.vue')
const WorkOrderDetail = () => import('@/views/workorder/WorkOrderDetail.vue')

// 基础数据管理
const CustomerList = () => import('@/views/customer/CustomerList.vue')
const DepartmentList = () => import('@/views/department/DepartmentList.vue')
const ProcessList = () => import('@/views/process/ProcessList.vue')
const ProcessLogList = () => import('@/views/process/ProcessLog.vue')
const ProductList = () => import('@/views/product/ProductList.vue')
const MaterialList = () => import('@/views/material/MaterialList.vue')
const ProductGroupList = () => import('@/views/product-group/ProductGroupList.vue')

// 版和模具管理
const ArtworkList = () => import('@/views/artwork/ArtworkList.vue')
const DieList = () => import('@/views/die/DieList.vue')
const FoilingPlateList = () => import('@/views/foiling-plate/FoilingPlateList.vue')
const EmbossingPlateList = () => import('@/views/embossing-plate/EmbossingPlateList.vue')

// 供应商和采购
const SupplierList = () => import('@/views/supplier/SupplierList.vue')
const PurchaseOrderList = () => import('@/views/purchase/PurchaseList.vue')

// 销售订单
const SalesOrderList = () => import('@/views/sales/SalesList.vue')
const SalesForm = () => import('@/views/sales/SalesForm.vue')
const SalesDetail = () => import('@/views/sales/SalesDetail.vue')

// 任务管理
const TaskList = () => import('@/views/task/TaskList.vue')
const OperatorCenter = () => import('@/views/task/OperatorCenter.vue')
const SupervisorDashboard = () => import('@/views/task/SupervisorDashboard.vue')
const AssignmentRule = () => import('@/views/task/AssignmentRule.vue')

// 通知中心
const Notification = () => import('@/views/Notification.vue')
const NotificationAdmin = () => import('@/views/notification/NotificationAdmin.vue')

// 财务管理
const InvoiceList = () => import('@/views/finance/Invoice.vue')
const PaymentList = () => import('@/views/finance/Payment.vue')
const CostList = () => import('@/views/finance/Cost.vue')
const StatementList = () => import('@/views/finance/Statement.vue')
const CostCenterList = () => import('@/views/finance/CostCenter.vue')
const CostItemList = () => import('@/views/finance/CostItem.vue')
const PaymentPlanList = () => import('@/views/finance/PaymentPlan.vue')

// 库存管理
const StockList = () => import('@/views/inventory/Stock.vue')
const DeliveryList = () => import('@/views/inventory/Delivery.vue')
const QualityList = () => import('@/views/inventory/Quality.vue')
const StockInList = () => import('@/views/inventory/StockIn.vue')
const StockOutList = () => import('@/views/inventory/StockOut.vue')

// 用户设置
const Profile = () => import('@/views/Profile.vue')

// 审计日志
const AuditLogList = () => import('@/views/audit/AuditLogList.vue')

// 404
const NotFound = () => import('@/views/NotFound.vue')

// ==================== 路由定义 ====================

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 未找到', requiresAuth: false }
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '工作台', requiresAuth: true }
      },
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
        meta: { title: '新建施工单', requiresAuth: true, requiresPermission: ['workorder.view_workorder'] }
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
        meta: { title: '编辑施工单', requiresAuth: true, requiresPermission: ['workorder.view_workorder'] }
      },
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
      },
      {
        path: 'artworks',
        name: 'ArtworkList',
        component: ArtworkList,
        meta: { title: '图稿管理', requiresAuth: true, requiresPermission: ['workorder.view_artwork'] }
      },
      {
        path: 'dies',
        name: 'DieList',
        component: DieList,
        meta: { title: '刀模管理', requiresAuth: true, requiresPermission: ['workorder.view_die'] }
      },
      {
        path: 'foiling-plates',
        name: 'FoilingPlateList',
        component: FoilingPlateList,
        meta: { title: '烫金版管理', requiresAuth: true, requiresPermission: ['workorder.view_foilingplate'] }
      },
      {
        path: 'embossing-plates',
        name: 'EmbossingPlateList',
        component: EmbossingPlateList,
        meta: { title: '压凸版管理', requiresAuth: true, requiresPermission: ['workorder.view_embossingplate'] }
      },
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
        meta: { title: '采购单管理', requiresAuth: true, requiresPermission: ['workorder.view_purchaseorder'] }
      },
      {
        path: 'sales-orders',
        name: 'SalesOrderList',
        component: SalesOrderList,
        meta: { title: '销售订单管理', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
      },
      {
        path: 'sales-orders/create',
        name: 'SalesOrderCreate',
        component: SalesForm,
        meta: { title: '新建销售订单', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
      },
      {
        path: 'sales-orders/:id',
        name: 'SalesOrderDetail',
        component: SalesDetail,
        meta: { title: '销售订单详情', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
      },
      {
        path: 'sales-orders/:id/edit',
        name: 'SalesOrderEdit',
        component: SalesForm,
        meta: { title: '编辑销售订单', requiresAuth: true, requiresPermission: ['workorder.view_salesorder'] }
      },
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
        meta: { title: '分派规则配置', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_taskassignmentrule'] }
      },
      {
        path: 'notifications',
        name: 'Notification',
        component: Notification,
        meta: { title: '通知中心', requiresAuth: true }
      },
      {
        path: 'system-notifications',
        name: 'NotificationAdmin',
        component: NotificationAdmin,
        meta: { title: '系统通知管理', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_systemnotificationsettings', 'workorder.view_notificationtemplate'] }
      },
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
      },
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
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'audit-logs',
        name: 'AuditLogList',
        component: AuditLogList,
        meta: { title: '审计日志', requiresAuth: true, requiresAdmin: true, requiresPermission: ['workorder.view_auditlog'] }
      }
    ]
  }
]

// ==================== Router 实例 ====================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// ==================== 认证检查 ====================

let isAuthChecking = false
let authCheckPromise: Promise<boolean> | null = null

async function checkAuthentication(): Promise<boolean> {
  const userStore = useUserStore()

  if (userStore.currentUser) {
    return true
  }

  if (isAuthChecking && authCheckPromise) {
    try {
      await authCheckPromise
      return !!userStore.currentUser
    } catch {
      return false
    }
  }

  isAuthChecking = true
  authCheckPromise = (async () => {
    try {
      const response = await authAPI.getCurrentUser() as any
      const userInfo = response?.data || response
      if (response?.success && userInfo && userInfo.id) {
        userStore.setUser(userInfo)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      isAuthChecking = false
      authCheckPromise = null
    }
  })()

  return authCheckPromise
}

// ==================== 页面标题解析 ====================

function resolveDocumentTitle(title?: string): string {
  if (!title) return SITE_NAME
  return `${title} - ${SITE_NAME}`
}

// ==================== 导航守卫 ====================

router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = resolveDocumentTitle(to.meta.title as string | undefined)

  const requiresAuth = to.matched.some((record: any) => record.meta.requiresAuth !== false)

  if (!requiresAuth) {
    // 公开路由：已登录用户访问登录页则跳转
    if (to.path === '/login') {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        const redirect = (to.query.redirect as string) || from.fullPath || '/dashboard'
        next(redirect)
        return
      }
    }
    next()
    return
  }

  // 需要认证的路由
  const isLoggedIn = await checkAuthentication()

  if (!isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
    return
  }

  // 检查管理员权限
  const requiresAdmin = to.matched.some((record: any) => record.meta.requiresAdmin === true)
  if (requiresAdmin) {
    const userStore = useUserStore()
    if (!userStore.isStaff && !userStore.isSuperuser) {
      next({ path: '/dashboard', replace: true })
      return
    }
  }

  // 检查特定权限
  const requiredPermission = to.meta.requiresPermission
  if (requiredPermission) {
    const userStore = useUserStore()
    const perms = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    if (!userStore.hasAnyPermission(perms)) {
      next({ path: '/dashboard', replace: true })
      return
    }
  }

  next()
})

// ==================== Chunk 加载错误处理 ====================

router.onError((error: Error) => {
  console.error('Router error:', error)

  const isChunkLoadError =
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('Loading CSS chunk') ||
    error.name === 'ChunkLoadError'

  if (isChunkLoadError) {
    const reloadKey = 'chunk_reload_attempted'
    const lastReload = sessionStorage.getItem(reloadKey)
    const now = Date.now()

    // 允许重载：从未重载过，或距离上次重载超过 10 秒
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem(reloadKey, now.toString())
      console.warn('Chunk load error detected, reloading page to fetch latest version...')
      window.location.reload()
    } else {
      console.error('Chunk load error persists after reload. Please clear browser cache.')
    }
  }
})

export default router
