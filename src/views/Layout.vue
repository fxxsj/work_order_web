<template>
  <el-container class="layout-container" :class="{ 'is-sidebar-open': mobileSidebarOpen }">
    <div class="mobile-sidebar-mask" @click="mobileSidebarOpen = false"></div>
    <el-aside width="var(--ui-layout-sidebar-width)" class="sidebar">
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
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/workorders">
          <el-icon><Document /></el-icon>
          <span>施工单</span>
        </el-menu-item>

        <el-sub-menu index="/tasks">
          <template #title>
            <el-icon><List /></el-icon>
            <span>任务管理</span>
          </template>
          <el-menu-item index="/tasks">
            <el-icon><Tickets /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/tasks/board">
            <el-icon><Grid /></el-icon>
            <span>部门任务看板</span>
          </el-menu-item>
          <el-menu-item index="/tasks/stats">
            <el-icon><DataAnalysis /></el-icon>
            <span>协作统计</span>
          </el-menu-item>
          <el-menu-item index="/tasks/assignment-history">
            <el-icon><Clock /></el-icon>
            <span>分派历史</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="canViewProduct || canViewMaterial || canViewProductGroup" index="/product-material">
          <template #title>
            <el-icon><ShoppingBag /></el-icon>
            <span>产品物料</span>
          </template>
          <el-menu-item v-if="canViewProduct" index="/products">
            <el-icon><Goods /></el-icon>
            <span>产品管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewMaterial" index="/materials">
            <el-icon><Box /></el-icon>
            <span>物料管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewProductGroup" index="/product-groups">
            <el-icon><Collection /></el-icon>
            <span>产品组管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="canViewArtwork || canViewDie || canViewFoilingPlate || canViewEmbossingPlate" index="/plate-making">
          <template #title>
            <el-icon><Printer /></el-icon>
            <span>制版管理</span>
          </template>
          <el-menu-item v-if="canViewArtwork" index="/artworks">
            <el-icon><Picture /></el-icon>
            <span>图稿管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewDie" index="/dies">
            <el-icon><Scissor /></el-icon>
            <span>刀模管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewFoilingPlate" index="/foiling-plates">
            <el-icon><EditPen /></el-icon>
            <span>烫金版管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewEmbossingPlate" index="/embossing-plates">
            <el-icon><Grid /></el-icon>
            <span>压凸版管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="canViewPurchaseOrder || canViewSalesOrder" index="/purchase">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>采购销售</span>
          </template>
          <el-menu-item v-if="canViewPurchaseOrder" index="/purchase-orders">
            <el-icon><Document /></el-icon>
            <span>采购单管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewSalesOrder" index="/sales-orders">
            <el-icon><SoldOut /></el-icon>
            <span>销售订单</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/inventory">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory/stocks">
            <el-icon><Goods /></el-icon>
            <span>成品库存</span>
          </el-menu-item>
          <el-menu-item index="/inventory/delivery">
            <el-icon><Van /></el-icon>
            <span>发货管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory/quality">
            <el-icon><CircleCheck /></el-icon>
            <span>质量检验</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/finance">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/finance/invoices">
            <el-icon><Ticket /></el-icon>
            <span>发票管理</span>
          </el-menu-item>
          <el-menu-item index="/finance/payments">
            <el-icon><Coin /></el-icon>
            <span>收款管理</span>
          </el-menu-item>
          <el-menu-item index="/finance/costs">
            <el-icon><PieChart /></el-icon>
            <span>成本核算</span>
          </el-menu-item>
          <el-menu-item index="/finance/statements">
            <el-icon><Money /></el-icon>
            <span>对账管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="canViewCustomer || canViewSupplier || canViewDepartment || canViewProcess || canViewAuditLog" index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item v-if="canViewCustomer" index="/customers">
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewSupplier" index="/suppliers">
            <el-icon><UserFilled /></el-icon>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewDepartment" index="/departments">
            <el-icon><Menu /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item v-if="canViewProcess" index="/processes">
            <el-icon><Tools /></el-icon>
            <span>工序管理</span>
          </el-menu-item>
          <el-menu-item index="/tasks/assignment-rules">
            <el-icon><Operation /></el-icon>
            <span>分派规则配置</span>
          </el-menu-item>
          <el-menu-item v-if="canViewAuditLog" index="/audit-logs">
            <el-icon><DocumentChecked /></el-icon>
            <span>审计日志</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container class="content-shell">
      <el-header class="header">
        <div class="header-left">
          <el-button
            class="mobile-menu-button"
            :icon="Menu"
            text
            aria-label="打开导航"
            @click="mobileSidebarOpen = true"
          />
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
              <el-icon><UserFilled /></el-icon>
              <span>{{ currentUsername }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
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
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  HomeFilled, Document, List, Tickets, Grid, DataAnalysis, Clock,
  ShoppingBag, Goods, Box, Collection, Printer, Picture, Scissor, EditPen,
  ShoppingCart, SoldOut, Van, CircleCheck, Wallet, Ticket, Coin, PieChart,
  Money, Setting, User, UserFilled, Menu, Tools, Operation, DocumentChecked,
  ArrowDown
} from '@element-plus/icons-vue'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import NotificationCenter from '@/components/NotificationCenter.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const mobileSidebarOpen = ref(false)

watch(() => route.fullPath, () => {
  mobileSidebarOpen.value = false
})

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

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.layout-container {
  height: 100vh;
  position: relative;
}

.content-shell {
  min-width: 0;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;
  overflow-y: auto;
  transition: transform 0.2s ease;
  z-index: 30;
}

.logo {
  height: var(--ui-layout-header-height);
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
  height: var(--ui-layout-header-height);
  padding: 0 var(--ui-page-padding);
}

.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
  min-width: 0;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: var(--ui-touch-target-min);
  padding: 0 var(--ui-control-gap);
}

.user-info:hover {
  background-color: #f5f5f5;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
  padding: 0;
}

.mobile-menu-button,
.mobile-sidebar-mask {
  display: none;
}

@media (max-width: bp.$breakpoint-tablet-max) {
  .layout-container {
    display: block;
  }

  .content-shell {
    height: 100vh;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--ui-layout-sidebar-width) !important;
    transform: translateX(-100%);
  }

  .is-sidebar-open .sidebar {
    transform: translateX(0);
  }

  .mobile-sidebar-mask {
    position: fixed;
    inset: 0;
    display: block;
    pointer-events: none;
    background: rgba(0, 0, 0, 0);
    transition: background 0.2s ease;
    z-index: 20;
  }

  .is-sidebar-open .mobile-sidebar-mask {
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.35);
  }

  .mobile-menu-button {
    display: inline-flex;
    flex: 0 0 auto;
  }
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-right {
    gap: 4px;
  }

  .header-left :deep(.el-breadcrumb) {
    display: none;
  }

  .user-info span {
    max-width: var(--ui-mobile-user-name-width, 7em);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
