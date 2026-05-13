import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { authAPI } from '@/api/modules'

// 路由懒加载 - Vue Router 4 语法
const Login = () => import('@/views/Login.vue')
const Layout = () => import('@/views/Layout.vue')
const Dashboard = () => import('@/views/Dashboard.vue')

// 施工单管理
const WorkOrderList = () => import('@/views/workorder/WorkOrderList.vue')
const WorkOrderForm = () => import('@/views/workorder/WorkOrderForm.vue')
const WorkOrderDetail = () => import('@/views/workorder/WorkOrderDetail.vue')

// 基础数据管理
const CustomerList = () => import('@/views/customer/CustomerList.vue')
const DepartmentList = () => import('@/views/department/DepartmentList.vue')
const ProcessList = () => import('@/views/process/ProcessList.vue')
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
const TaskBoard = () => import('@/views/task/Board.vue')
const TaskStats = () => import('@/views/task/Stats.vue')
const AssignmentHistory = () => import('@/views/task/AssignmentHistory.vue')
const AssignmentRule = () => import('@/views/task/AssignmentRule.vue')

// 通知中心
const Notification = () => import('@/views/Notification.vue')

// 财务管理
const InvoiceList = () => import('@/views/finance/Invoice.vue')
const PaymentList = () => import('@/views/finance/Payment.vue')
const CostList = () => import('@/views/finance/Cost.vue')
const StatementList = () => import('@/views/finance/Statement.vue')

// 库存管理
const StockList = () => import('@/views/inventory/Stock.vue')
const DeliveryList = () => import('@/views/inventory/Delivery.vue')
const QualityList = () => import('@/views/inventory/Quality.vue')

// 用户设置
const Profile = () => import('@/views/Profile.vue')

// 审计日志
const AuditLogList = () => import('@/views/audit/AuditLogList.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
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
        meta: { title: '施工单列表', requiresAuth: true }
      },
      {
        path: 'workorders/create',
        name: 'WorkOrderCreate',
        component: WorkOrderForm,
        meta: { title: '新建施工单', requiresAuth: true }
      },
      {
        path: 'workorders/:id',
        name: 'WorkOrderDetail',
        component: WorkOrderDetail,
        meta: { title: '施工单详情', requiresAuth: true }
      },
      {
        path: 'workorders/:id/edit',
        name: 'WorkOrderEdit',
        component: WorkOrderForm,
        props: true,
        meta: { title: '编辑施工单', requiresAuth: true }
      },
      {
        path: 'customers',
        name: 'CustomerList',
        component: CustomerList,
        meta: { title: '客户管理', requiresAuth: true }
      },
      {
        path: 'departments',
        name: 'DepartmentList',
        component: DepartmentList,
        meta: { title: '部门管理', requiresAuth: true }
      },
      {
        path: 'processes',
        name: 'ProcessList',
        component: ProcessList,
        meta: { title: '工序管理', requiresAuth: true }
      },
      {
        path: 'products',
        name: 'ProductList',
        component: ProductList,
        meta: { title: '产品管理', requiresAuth: true }
      },
      {
        path: 'materials',
        name: 'MaterialList',
        component: MaterialList,
        meta: { title: '物料管理', requiresAuth: true }
      },
      {
        path: 'product-groups',
        name: 'ProductGroupList',
        component: ProductGroupList,
        meta: { title: '产品组管理', requiresAuth: true }
      },
      {
        path: 'artworks',
        name: 'ArtworkList',
        component: ArtworkList,
        meta: { title: '图稿管理', requiresAuth: true }
      },
      {
        path: 'dies',
        name: 'DieList',
        component: DieList,
        meta: { title: '刀模管理', requiresAuth: true }
      },
      {
        path: 'foiling-plates',
        name: 'FoilingPlateList',
        component: FoilingPlateList,
        meta: { title: '烫金版管理', requiresAuth: true }
      },
      {
        path: 'embossing-plates',
        name: 'EmbossingPlateList',
        component: EmbossingPlateList,
        meta: { title: '压凸版管理', requiresAuth: true }
      },
      {
        path: 'suppliers',
        name: 'SupplierList',
        component: SupplierList,
        meta: { title: '供应商管理', requiresAuth: true }
      },
      {
        path: 'purchase-orders',
        name: 'PurchaseOrderList',
        component: PurchaseOrderList,
        meta: { title: '采购单管理', requiresAuth: true }
      },
      {
        path: 'sales-orders',
        name: 'SalesOrderList',
        component: SalesOrderList,
        meta: { title: '销售订单管理', requiresAuth: true }
      },
      {
        path: 'sales-orders/create',
        name: 'SalesOrderCreate',
        component: SalesForm,
        meta: { title: '新建销售订单', requiresAuth: true }
      },
      {
        path: 'sales-orders/:id',
        name: 'SalesOrderDetail',
        component: SalesDetail,
        meta: { title: '销售订单详情', requiresAuth: true }
      },
      {
        path: 'sales-orders/:id/edit',
        name: 'SalesOrderEdit',
        component: SalesForm,
        meta: { title: '编辑销售订单', requiresAuth: true }
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { title: '任务管理', requiresAuth: true }
      },
      {
        path: 'tasks/operator',
        name: 'OperatorCenter',
        component: OperatorCenter,
        meta: { title: '操作员任务中心', requiresAuth: true }
      },
      {
        path: 'tasks/supervisor',
        name: 'SupervisorDashboard',
        component: SupervisorDashboard,
        meta: { title: '主管看板', requiresAuth: true }
      },
      {
        path: 'tasks/board',
        name: 'TaskBoard',
        component: TaskBoard,
        meta: { title: '部门任务看板', requiresAuth: true }
      },
      {
        path: 'tasks/stats',
        name: 'TaskStats',
        component: TaskStats,
        meta: { title: '协作统计', requiresAuth: true }
      },
      {
        path: 'tasks/assignment-history',
        name: 'AssignmentHistory',
        component: AssignmentHistory,
        meta: { title: '分派历史', requiresAuth: true }
      },
      {
        path: 'tasks/assignment-rules',
        name: 'AssignmentRule',
        component: AssignmentRule,
        meta: { title: '分派规则配置', requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'Notification',
        component: Notification,
        meta: { title: '通知中心', requiresAuth: true }
      },
      {
        path: 'finance/invoices',
        name: 'InvoiceList',
        component: InvoiceList,
        meta: { title: '发票管理', requiresAuth: true }
      },
      {
        path: 'finance/payments',
        name: 'PaymentList',
        component: PaymentList,
        meta: { title: '收款管理', requiresAuth: true }
      },
      {
        path: 'finance/costs',
        name: 'CostList',
        component: CostList,
        meta: { title: '成本核算', requiresAuth: true }
      },
      {
        path: 'finance/statements',
        name: 'StatementList',
        component: StatementList,
        meta: { title: '对账管理', requiresAuth: true }
      },
      {
        path: 'inventory/stocks',
        name: 'StockList',
        component: StockList,
        meta: { title: '成品库存', requiresAuth: true }
      },
      {
        path: 'inventory/delivery',
        name: 'DeliveryList',
        component: DeliveryList,
        meta: { title: '发货管理', requiresAuth: true }
      },
      {
        path: 'inventory/quality',
        name: 'QualityList',
        component: QualityList,
        meta: { title: '质量检验', requiresAuth: true }
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
        meta: { title: '审计日志', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 防止重复导航的标志
let isAuthChecking = false
let authCheckPromise = null

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 印刷施工单跟踪系统`
    : '印刷施工单跟踪系统'

  if (requiresAuth) {
    const userStore = useUserStore()

    if (!userStore.currentUser) {
      if (isAuthChecking && authCheckPromise) {
        try {
          await authCheckPromise
          if (userStore.currentUser) {
            next()
            return
          }
          next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
          return
        } catch (error) {
          next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
          return
        }
      }

      isAuthChecking = true
      authCheckPromise = (async () => {
        try {
          const response = await authAPI.getCurrentUser()
          const userInfo = response?.data || response
          if (response?.success && userInfo && userInfo.id) {
            userStore.setUser(userInfo)
            return true
          }
          return false
        } catch (error) {
          return false
        } finally {
          isAuthChecking = false
          authCheckPromise = null
        }
      })()

      try {
        const isLoggedIn = await authCheckPromise
        if (isLoggedIn) {
          next()
        } else {
          next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
        }
      } catch (error) {
        next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
      }
    } else {
      next()
    }
  } else {
    if (to.path === '/login') {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        const redirect = to.query.redirect || from.fullPath || '/'
        next(redirect)
      } else {
        next()
      }
    } else {
      next()
    }
  }
})

export default router
