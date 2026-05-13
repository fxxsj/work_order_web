<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>施工单系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-s-home"></i>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/workorders">
          <i class="el-icon-document"></i>
          <span>施工单</span>
        </el-menu-item>

        <el-submenu index="/tasks">
          <template #title>
            <i class="el-icon-s-order"></i>
            <span>任务管理</span>
          </template>
          <el-menu-item index="/tasks">
            <i class="el-icon-tickets"></i>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/tasks/board">
            <i class="el-icon-s-grid"></i>
            <span>部门任务看板</span>
          </el-menu-item>
          <el-menu-item index="/tasks/stats">
            <i class="el-icon-s-data"></i>
            <span>协作统计</span>
          </el-menu-item>
          <el-menu-item index="/tasks/assignment-history">
            <i class="el-icon-time"></i>
            <span>分派历史</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu v-if="canViewProduct || canViewMaterial || canViewProductGroup" index="/product-material">
          <template #title>
            <i class="el-icon-shopping-bag-2"></i>
            <span>产品物料</span>
          </template>
          <el-menu-item v-if="canViewProduct" index="/products">
            <i class="el-icon-shopping-bag-1"></i>
            <span>产品管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewMaterial" index="/materials">
            <i class="el-icon-goods"></i>
            <span>物料管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewProductGroup" index="/product-groups">
            <i class="el-icon-collection"></i>
            <span>产品组管理</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu v-if="canViewArtwork || canViewDie || canViewFoilingPlate || canViewEmbossingPlate" index="/plate-making">
          <template #title>
            <i class="el-icon-printer"></i>
            <span>制版管理</span>
          </template>
          <el-menu-item v-if="canViewArtwork" index="/artworks">
            <i class="el-icon-picture"></i>
            <span>图稿管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewDie" index="/dies">
            <i class="el-icon-scissors"></i>
            <span>刀模管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewFoilingPlate" index="/foiling-plates">
            <i class="el-icon-edit-outline"></i>
            <span>烫金版管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewEmbossingPlate" index="/embossing-plates">
            <i class="el-icon-s-grid"></i>
            <span>压凸版管理</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu v-if="canViewPurchaseOrder || canViewSalesOrder" index="/purchase">
          <template #title>
            <i class="el-icon-shopping-cart-2"></i>
            <span>采购销售</span>
          </template>
          <el-menu-item v-if="canViewPurchaseOrder" index="/purchase-orders">
            <i class="el-icon-document"></i>
            <span>采购单管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewSalesOrder" index="/sales-orders">
            <i class="el-icon-sold-out"></i>
            <span>销售订单</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu index="/inventory">
          <template #title>
            <i class="el-icon-box"></i>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory/stocks">
            <i class="el-icon-goods"></i>
            <span>成品库存</span>
          </el-menu-item>
          <el-menu-item index="/inventory/delivery">
            <i class="el-icon-truck"></i>
            <span>发货管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory/quality">
            <i class="el-icon-circle-check"></i>
            <span>质量检验</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu index="/finance">
          <template #title>
            <i class="el-icon-wallet"></i>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/finance/invoices">
            <i class="el-icon-s-ticket"></i>
            <span>发票管理</span>
          </el-menu-item>
          <el-menu-item index="/finance/payments">
            <i class="el-icon-coin"></i>
            <span>收款管理</span>
          </el-menu-item>
          <el-menu-item index="/finance/costs">
            <i class="el-icon-pie-chart"></i>
            <span>成本核算</span>
          </el-menu-item>
          <el-menu-item index="/finance/statements">
            <i class="el-icon-s-finance"></i>
            <span>对账管理</span>
          </el-menu-item>
        </el-submenu>

        <el-submenu v-if="canViewCustomer || canViewSupplier || canViewDepartment || canViewProcess || canViewAuditLog" index="/system">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </template>
          <el-menu-item v-if="canViewCustomer" index="/customers">
            <i class="el-icon-user"></i>
            <span>客户管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewSupplier" index="/suppliers">
            <i class="el-icon-s-custom"></i>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewDepartment" index="/departments">
            <i class="el-icon-menu"></i>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewProcess" index="/processes">
            <i class="el-icon-s-tools"></i>
            <span>工序管理</span>
          </el-menu-item>
          <el-menu-item index="/tasks/assignment-rules">
            <i class="el-icon-s-operation"></i>
            <span>分派规则配置</span>
          </el-menu-item>
          <el-menu-item v-if="canViewAuditLog" index="/audit-logs">
            <i class="el-icon-document-checked"></i>
            <span>审计日志</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <notification-center />

          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <i class="el-icon-user-solid"></i>
              <span>{{ currentUsername }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item v-if="canAccessAdmin" command="admin">
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import NotificationCenter from '@/components/NotificationCenter.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/workorders')) return '/workorders'
  if (path.startsWith('/processes')) return '/processes'
  if (path.startsWith('/artworks') || path.startsWith('/dies') ||
      path.startsWith('/foiling-plates') || path.startsWith('/embossing-plates')) return '/plate-making'
  if (path.startsWith('/tasks')) return '/tasks'
  if (path.startsWith('/suppliers') || path.startsWith('/purchase-orders') || path.startsWith('/sales-orders')) return '/purchase'
  if (path.startsWith('/inventory')) return '/inventory'
  if (path.startsWith('/finance')) return '/finance'
  if (path.startsWith('/audit-logs')) return '/audit-logs'
  return path
})

const currentUsername = computed(() => userStore.currentUser?.username || '用户')
const canAccessAdmin = computed(() => userStore.currentUser?.is_staff === true)
const canViewCustomer = computed(() => userStore.hasPermission('workorder.view_customer'))
const canViewDepartment = computed(() => userStore.hasPermission('workorder.view_department'))
const canViewProcess = computed(() => userStore.hasPermission('workorder.view_process'))
const canViewProduct = computed(() => userStore.hasPermission('workorder.view_product'))
const canViewMaterial = computed(() => userStore.hasPermission('workorder.view_material'))
const canViewArtwork = computed(() => userStore.hasPermission('workorder.view_artwork'))
const canViewDie = computed(() => userStore.hasPermission('workorder.view_die'))
const canViewFoilingPlate = computed(() => userStore.hasPermission('workorder.view_foilingplate'))
const canViewEmbossingPlate = computed(() => userStore.hasPermission('workorder.view_embossingplate'))
const canViewProductGroup = computed(() => userStore.hasPermission('workorder.view_productgroup'))
const canViewSupplier = computed(() => userStore.hasPermission('workorder.view_supplier'))
const canViewPurchaseOrder = computed(() => userStore.hasPermission('workorder.view_purchaseorder'))
const canViewSalesOrder = computed(() => userStore.hasPermission('workorder.view_salesorder'))
const canViewAuditLog = computed(() => userStore.hasPermission('workorder.view_auditlog'))

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'admin') {
    const adminWindow = window.open('', '_blank', 'noopener')
    authAPI.createAdminSession().then(result => {
      const adminUrl = result?.admin_url || result?.data?.admin_url || '/admin/'
      if (adminWindow) {
        adminWindow.location = adminUrl
      } else {
        window.open(adminUrl, '_blank', 'noopener')
      }
    }).catch(error => {
      if (adminWindow) adminWindow.close()
      ErrorHandler.handle(error, {
        context: '打开管理后台',
        fallbackMessage: '无法进入管理后台，请确认当前账号具备后台权限'
      })
    })
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在退出登录...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        await authAPI.logout()
      } catch (e) {
        logger.warn('后端登出API调用失败，但继续清除本地状态', e)
      }

      userStore.clearUser()
      loading.close()
      ElMessage.success('已退出登录')

      setTimeout(() => {
        window.location.href = '/login'
      }, 500)
    }).catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
}

.logo h2 {
  color: white;
  margin: 0;
  font-size: 18px;
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>
