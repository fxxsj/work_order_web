<template>
  <aside
    class="sidebar"
    :class="[
      collapsed ? 'w-[72px]' : 'w-64',
      { '-translate-x-full lg:translate-x-0': !mobileOpen }
    ]"
  >
    <!-- Logo/Brand -->
    <div class="sidebar-header" :class="{ 'sidebar-header-collapsed': collapsed }">
      <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary-500 shadow-md shadow-primary-500/25">
        <span class="text-sm font-bold text-white">印</span>
      </div>
      <div class="sidebar-brand" :class="{ 'sidebar-brand-collapsed': collapsed }" :aria-hidden="collapsed ? 'true' : 'false'">
        <span class="block truncate text-lg font-bold text-gray-900 dark:text-white">施工单系统</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav scrollbar-hide">
      <!-- Main Nav Items -->
      <div class="sidebar-section">
        <router-link
          v-for="item in mainNavItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-link mb-1"
          :class="{ 'sidebar-link-active': isActiveRoute(item.path), 'sidebar-link-collapsed': collapsed }"
          :title="collapsed ? item.label : undefined"
          @click="$emit('close-mobile')"
        >
          <el-icon :size="20" class="flex-shrink-0">
            <component :is="item.icon" />
          </el-icon>
          <span class="sidebar-label" :class="{ 'sidebar-label-collapsed': collapsed }" :aria-hidden="collapsed ? 'true' : 'false'">{{ item.label }}</span>
        </router-link>
      </div>

      <!-- 任务管理 -->
      <template v-if="!collapsed">
        <div class="sidebar-section">
          <div class="sidebar-section-title">任务管理</div>
          <router-link to="/tasks" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path === '/tasks' && route.path.startsWith('/tasks') }" @click="$emit('close-mobile')">
            <el-icon :size="16" class="flex-shrink-0"><Tickets /></el-icon>
            <span>任务列表</span>
          </router-link>
          <router-link to="/tasks/board" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path === '/tasks/board' }" @click="$emit('close-mobile')">
            <el-icon :size="16" class="flex-shrink-0"><Grid /></el-icon>
            <span>部门任务看板</span>
          </router-link>
          <router-link to="/tasks/stats" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path === '/tasks/stats' }" @click="$emit('close-mobile')">
            <el-icon :size="16" class="flex-shrink-0"><DataAnalysis /></el-icon>
            <span>协作统计</span>
          </router-link>
          <router-link to="/tasks/assignment-history" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path === '/tasks/assignment-history' }" @click="$emit('close-mobile')">
            <el-icon :size="16" class="flex-shrink-0"><Clock /></el-icon>
            <span>分派历史</span>
          </router-link>
        </div>
      </template>

      <!-- 产品物料 -->
      <div v-if="(canViewProduct || canViewMaterial || canViewProductGroup) && !collapsed" class="sidebar-section">
        <div class="sidebar-section-title">产品物料</div>
        <router-link v-if="canViewProduct" to="/products" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/products') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Goods /></el-icon>
          <span>产品管理</span>
        </router-link>
        <router-link v-if="canViewMaterial" to="/materials" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/materials') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Box /></el-icon>
          <span>物料管理</span>
        </router-link>
        <router-link v-if="canViewProductGroup" to="/product-groups" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/product-groups') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Collection /></el-icon>
          <span>产品组管理</span>
        </router-link>
      </div>

      <!-- 制版管理 -->
      <div v-if="(canViewArtwork || canViewDie || canViewFoilingPlate || canViewEmbossingPlate) && !collapsed" class="sidebar-section">
        <div class="sidebar-section-title">制版管理</div>
        <router-link v-if="canViewArtwork" to="/artworks" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/artworks') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Picture /></el-icon>
          <span>图稿管理</span>
        </router-link>
        <router-link v-if="canViewDie" to="/dies" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/dies') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Scissor /></el-icon>
          <span>刀模管理</span>
        </router-link>
        <router-link v-if="canViewFoilingPlate" to="/foiling-plates" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/foiling-plates') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><EditPen /></el-icon>
          <span>烫金版管理</span>
        </router-link>
        <router-link v-if="canViewEmbossingPlate" to="/embossing-plates" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/embossing-plates') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Grid /></el-icon>
          <span>压凸版管理</span>
        </router-link>
      </div>

      <!-- 采购销售 -->
      <div v-if="(canViewPurchaseOrder || canViewSalesOrder) && !collapsed" class="sidebar-section">
        <div class="sidebar-section-title">采购销售</div>
        <router-link v-if="canViewPurchaseOrder" to="/purchase-orders" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/purchase-orders') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Document /></el-icon>
          <span>采购单管理</span>
        </router-link>
        <router-link v-if="canViewSalesOrder" to="/sales-orders" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/sales-orders') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><SoldOut /></el-icon>
          <span>销售订单</span>
        </router-link>
      </div>

      <!-- 库存管理 -->
      <div v-if="!collapsed" class="sidebar-section">
        <div class="sidebar-section-title">库存管理</div>
        <router-link to="/inventory/stocks" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/stocks') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Goods /></el-icon>
          <span>成品库存</span>
        </router-link>
        <router-link to="/inventory/delivery" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/delivery') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Van /></el-icon>
          <span>发货管理</span>
        </router-link>
        <router-link to="/inventory/quality" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/quality') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><CircleCheck /></el-icon>
          <span>质量检验</span>
        </router-link>
      </div>

      <!-- 财务管理 -->
      <div v-if="!collapsed" class="sidebar-section">
        <div class="sidebar-section-title">财务管理</div>
        <router-link to="/finance/invoices" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/finance/invoices') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Ticket /></el-icon>
          <span>发票管理</span>
        </router-link>
        <router-link to="/finance/payments" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/finance/payments') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Coin /></el-icon>
          <span>收款管理</span>
        </router-link>
        <router-link to="/finance/costs" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/finance/costs') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><PieChart /></el-icon>
          <span>成本核算</span>
        </router-link>
        <router-link to="/finance/statements" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/finance/statements') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Money /></el-icon>
          <span>对账管理</span>
        </router-link>
      </div>

      <!-- 系统设置 -->
      <div v-if="!collapsed" class="sidebar-section">
        <div class="sidebar-section-title">系统设置</div>
        <router-link v-if="canViewCustomer" to="/customers" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/customers') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><User /></el-icon>
          <span>客户管理</span>
        </router-link>
        <router-link v-if="canViewSupplier" to="/suppliers" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/suppliers') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><UserFilled /></el-icon>
          <span>供应商管理</span>
        </router-link>
        <router-link v-if="canViewDepartment" to="/departments" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/departments') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><MenuIcon /></el-icon>
          <span>部门管理</span>
        </router-link>
        <router-link v-if="canViewProcess" to="/processes" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/processes') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Tools /></el-icon>
          <span>工序管理</span>
        </router-link>
        <router-link to="/tasks/assignment-rules" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path === '/tasks/assignment-rules' }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><Operation /></el-icon>
          <span>分派规则配置</span>
        </router-link>
        <router-link v-if="canViewAuditLog" to="/audit-logs" class="sidebar-link mb-0.5 py-1.5 text-sm" :class="{ 'sidebar-link-active': route.path.startsWith('/audit-logs') }" @click="$emit('close-mobile')">
          <el-icon :size="16" class="flex-shrink-0"><DocumentChecked /></el-icon>
          <span>审计日志</span>
        </router-link>
      </div>

      <!-- Collapsed: dropdown for extra items -->
      <div v-if="collapsed" class="sidebar-section">
        <el-dropdown trigger="click" placement="right-start" @command="handleCommand">
          <div class="sidebar-link sidebar-link-collapsed justify-center">
            <el-icon :size="20" class="flex-shrink-0"><More /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in collapsedMenuItems" :key="item.path" :command="item.path">
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </nav>

    <!-- Bottom Section -->
    <div class="mt-auto border-t border-gray-100 p-3 dark:border-dark-800">
      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="sidebar-link mb-2 w-full"
        :class="{ 'sidebar-link-collapsed': collapsed }"
        :title="collapsed ? (isDark ? '亮色模式' : '暗色模式') : undefined"
      >
        <svg v-if="isDark" class="h-5 w-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
        <svg v-else class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        <span class="sidebar-label" :class="{ 'sidebar-label-collapsed': collapsed }" :aria-hidden="collapsed ? 'true' : 'false'">
          {{ isDark ? '亮色模式' : '暗色模式' }}
        </span>
      </button>

      <!-- Collapse Button -->
      <button
        @click="$emit('toggle-collapse')"
        class="sidebar-link w-full"
        :class="{ 'sidebar-link-collapsed': collapsed }"
        :title="collapsed ? '展开' : '收起'"
      >
        <svg v-if="!collapsed" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
        <svg v-else class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
        <span class="sidebar-label" :class="{ 'sidebar-label-collapsed': collapsed }" :aria-hidden="collapsed ? 'true' : 'false'">收起</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <transition name="fade">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="$emit('close-mobile')"
    ></div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Document,
  Tickets,
  Grid,
  DataAnalysis,
  Clock,
  Goods,
  Box,
  Collection,
  Picture,
  Scissor,
  EditPen,
  SoldOut,
  Van,
  CircleCheck,
  Ticket,
  Coin,
  PieChart,
  Money,
  User,
  UserFilled,
  Menu as MenuIcon,
  Tools,
  Operation,
  DocumentChecked,
  More
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-collapse', 'close-mobile'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isDark = ref(document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark')

// 权限检查
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

// 主要导航项
const mainNavItems = [
  { path: '/dashboard', label: '工作台', icon: HomeFilled },
  { path: '/workorders', label: '施工单', icon: Document }
]

// Collapsed menu items
const collapsedMenuItems = computed(() => {
  const items = [
    { path: '/tasks', label: '任务列表' },
    { path: '/tasks/board', label: '部门任务看板' },
    { path: '/inventory/stocks', label: '成品库存' },
    { path: '/finance/payments', label: '收款管理' },
  ]
  if (canViewCustomer.value) items.push({ path: '/customers', label: '客户管理' })
  if (canViewSupplier.value) items.push({ path: '/suppliers', label: '供应商管理' })
  return items
})

// 路由激活判断
const isActiveRoute = (path) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path) || route.path === path
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  window.dispatchEvent(new CustomEvent('theme-toggle', { detail: { dark: isDark.value } }))
}

const handleCommand = (path) => {
  router.push(path)
  emit('close-mobile')
}
</script>

<style scoped>
.sidebar-header-collapsed {
  gap: 0;
  padding-left: 1.125rem;
  padding-right: 1.125rem;
}

.sidebar-brand {
  min-width: 0;
  flex: 1 1 auto;
  white-space: nowrap;
  transition: max-width 0.22s ease, opacity 0.14s ease, transform 0.14s ease;
  max-width: 12rem;
}

.sidebar-brand-collapsed {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-4px);
  pointer-events: none;
}

.sidebar-link-collapsed {
  gap: 0;
  padding-left: 0.875rem;
  padding-right: 0.875rem;
}

.sidebar-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: max-width 0.2s ease, opacity 0.12s ease, transform 0.12s ease;
  max-width: 12rem;
}

.sidebar-label-collapsed {
  max-width: 0;
  opacity: 0;
  transform: translateX(-4px);
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>