<template>
  <aside
    class="sidebar"
    :class="[
      collapsed ? 'w-[72px]' : 'w-64',
      { '-translate-x-full lg:translate-x-0': !mobileOpen }
    ]"
  >
    <!-- Logo/Brand -->
    <div
      class="sidebar-header"
      :class="{ 'sidebar-header-collapsed': collapsed }"
    >
      <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary-500 shadow-md shadow-primary-500/25">
        <img
          v-if="branding.logoUrl"
          :src="branding.logoUrl"
          :alt="branding.appName"
          class="h-full w-full object-cover"
        >
        <span
          v-else
          class="text-sm font-bold text-white"
        >{{ branding.logoText }}</span>
      </div>
      <div
        class="sidebar-brand"
        :class="{ 'sidebar-brand-collapsed': collapsed }"
        :aria-hidden="collapsed ? 'true' : 'false'"
      >
        <span class="block truncate text-lg font-bold text-gray-900 dark:text-white">{{ branding.appShortName }}</span>
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
          <Icon
            :name="(item.icon as any)"
            size="md"
            class="flex-shrink-0"
          />
          <span
            class="sidebar-label"
            :class="{ 'sidebar-label-collapsed': collapsed }"
            :aria-hidden="collapsed ? 'true' : 'false'"
          >{{ item.label }}</span>
        </router-link>
      </div>

      <!-- 任务管理 -->
      <template v-if="canViewWorkOrderTask && !collapsed">
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            任务管理
          </div>
          <router-link
            to="/tasks"
            class="sidebar-link mb-0.5 py-1.5 text-sm"
            :class="{ 'sidebar-link-active': route.path === '/tasks' && route.path.startsWith('/tasks') }"
            @click="$emit('close-mobile')"
          >
            <Icon
              name="tickets"
              size="sm"
              class="flex-shrink-0"
            />
            <span>任务列表</span>
          </router-link>
          <router-link
            to="/tasks/operator"
            class="sidebar-link mb-0.5 py-1.5 text-sm"
            :class="{ 'sidebar-link-active': route.path === '/tasks/operator' }"
            @click="$emit('close-mobile')"
          >
            <Icon
              name="user"
              size="sm"
              class="flex-shrink-0"
            />
            <span>操作员任务中心</span>
          </router-link>
          <router-link
            to="/tasks/supervisor"
            class="sidebar-link mb-0.5 py-1.5 text-sm"
            :class="{ 'sidebar-link-active': route.path === '/tasks/supervisor' }"
            @click="$emit('close-mobile')"
          >
            <Icon
              name="grid"
              size="sm"
              class="flex-shrink-0"
            />
            <span>主管看板</span>
          </router-link>
        </div>
      </template>

      <!-- 产品物料 -->
      <div
        v-if="(canViewProduct || canViewMaterial || canViewProductGroup) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          产品物料
        </div>
        <router-link
          v-if="canViewProduct"
          to="/products"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/products') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="package"
            size="sm"
            class="flex-shrink-0"
          />
          <span>产品管理</span>
        </router-link>
        <router-link
          v-if="canViewMaterial"
          to="/materials"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/materials') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="archive"
            size="sm"
            class="flex-shrink-0"
          />
          <span>物料管理</span>
        </router-link>
        <router-link
          v-if="canViewProductGroup"
          to="/product-groups"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/product-groups') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="collection"
            size="sm"
            class="flex-shrink-0"
          />
          <span>产品组管理</span>
        </router-link>
      </div>

      <!-- 制版管理 -->
      <div
        v-if="(canViewArtwork || canViewDie || canViewFoilingPlate || canViewEmbossingPlate) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          制版管理
        </div>
        <router-link
          v-if="canViewArtwork"
          to="/artworks"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/artworks') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="image"
            size="sm"
            class="flex-shrink-0"
          />
          <span>图稿管理</span>
        </router-link>
        <router-link
          v-if="canViewDie"
          to="/dies"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/dies') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="scissors"
            size="sm"
            class="flex-shrink-0"
          />
          <span>刀模管理</span>
        </router-link>
        <router-link
          v-if="canViewFoilingPlate"
          to="/foiling-plates"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/foiling-plates') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="edit"
            size="sm"
            class="flex-shrink-0"
          />
          <span>烫金版管理</span>
        </router-link>
        <router-link
          v-if="canViewEmbossingPlate"
          to="/embossing-plates"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/embossing-plates') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="grid"
            size="sm"
            class="flex-shrink-0"
          />
          <span>压凸版管理</span>
        </router-link>
      </div>

      <!-- 采购销售 -->
      <div
        v-if="(canViewPurchaseOrder || canViewSalesOrder) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          采购销售
        </div>
        <router-link
          v-if="canViewPurchaseOrder"
          to="/purchase-orders"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/purchase-orders') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="document"
            size="sm"
            class="flex-shrink-0"
          />
          <span>采购订单</span>
        </router-link>
        <router-link
          v-if="canViewSalesOrder"
          to="/sales-orders"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/sales-orders') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="tag"
            size="sm"
            class="flex-shrink-0"
          />
          <span>客户订单</span>
        </router-link>
      </div>

      <!-- 库存管理 -->
      <div
        v-if="(canViewStock || canViewStockIn || canViewStockOut || canViewDelivery || canViewQuality) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          库存管理
        </div>
        <router-link
          v-if="canViewStock"
          to="/inventory/stocks"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/stocks') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="package"
            size="sm"
            class="flex-shrink-0"
          />
          <span>成品库存</span>
        </router-link>
        <router-link
          v-if="canViewStockIn"
          to="/inventory/stock-ins"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/stock-ins') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="download"
            size="sm"
            class="flex-shrink-0"
          />
          <span>入库单</span>
        </router-link>
        <router-link
          v-if="canViewStockOut"
          to="/inventory/stock-outs"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/stock-outs') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="upload"
            size="sm"
            class="flex-shrink-0"
          />
          <span>出库单</span>
        </router-link>
        <router-link
          v-if="canViewDelivery"
          to="/inventory/delivery"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/delivery') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="truck"
            size="sm"
            class="flex-shrink-0"
          />
          <span>发货管理</span>
        </router-link>
        <router-link
          v-if="canViewQuality"
          to="/inventory/quality"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/inventory/quality') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="checkCircle"
            size="sm"
            class="flex-shrink-0"
          />
          <span>质量检验</span>
        </router-link>
      </div>

      <!-- 财务管理 -->
      <div
        v-if="(canViewInvoice || canViewPayment || canViewPaymentPlan || canViewCostCenter || canViewCostItem || canViewCost || canViewStatement) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          财务管理
        </div>
        <router-link
          v-if="canViewInvoice"
          to="/finance/invoices"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/invoices') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="ticket"
            size="sm"
            class="flex-shrink-0"
          />
          <span>发票管理</span>
        </router-link>
        <router-link
          v-if="canViewPayment"
          to="/finance/payments"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/payments') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="dollar"
            size="sm"
            class="flex-shrink-0"
          />
          <span>收款管理</span>
        </router-link>
        <router-link
          v-if="canViewPaymentPlan"
          to="/finance/payment-plans"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/payment-plans') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="calendar"
            size="sm"
            class="flex-shrink-0"
          />
          <span>收款计划</span>
        </router-link>
        <router-link
          v-if="canViewCostCenter"
          to="/finance/cost-centers"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/cost-centers') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="grid"
            size="sm"
            class="flex-shrink-0"
          />
          <span>成本中心</span>
        </router-link>
        <router-link
          v-if="canViewCostItem"
          to="/finance/cost-items"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/cost-items') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="list"
            size="sm"
            class="flex-shrink-0"
          />
          <span>成本项目</span>
        </router-link>
        <router-link
          v-if="canViewCost"
          to="/finance/costs"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/costs') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="chart"
            size="sm"
            class="flex-shrink-0"
          />
          <span>成本核算</span>
        </router-link>
        <router-link
          v-if="canViewStatement"
          to="/finance/statements"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/finance/statements') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="dollar"
            size="sm"
            class="flex-shrink-0"
          />
          <span>对账管理</span>
        </router-link>
      </div>

      <!-- 系统设置 -->
      <div
        v-if="(canViewCustomer || canViewSupplier || canViewDepartment || canViewProcess || canViewTaskRule || canViewSystemNotification || canViewAuditLog) && !collapsed"
        class="sidebar-section"
      >
        <div class="sidebar-section-title">
          系统设置
        </div>
        <router-link
          v-if="canViewCustomer"
          to="/customers"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/customers') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="user"
            size="sm"
            class="flex-shrink-0"
          />
          <span>客户管理</span>
        </router-link>
        <router-link
          v-if="canViewSupplier"
          to="/suppliers"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/suppliers') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="user"
            size="sm"
            class="flex-shrink-0"
          />
          <span>供应商管理</span>
        </router-link>
        <router-link
          v-if="canViewDepartment"
          to="/departments"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/departments') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="menu"
            size="sm"
            class="flex-shrink-0"
          />
          <span>部门管理</span>
        </router-link>
        <router-link
          v-if="canViewProcess"
          to="/processes"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path === '/processes' }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="wrench"
            size="sm"
            class="flex-shrink-0"
          />
          <span>工序管理</span>
        </router-link>
        <router-link
          v-if="canViewTaskRule"
          to="/tasks/assignment-rules"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path === '/tasks/assignment-rules' }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="sliders"
            size="sm"
            class="flex-shrink-0"
          />
          <span>默认分派部门</span>
        </router-link>
        <router-link
          v-if="canViewSystemNotification"
          to="/system-notifications"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/system-notifications') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="bell"
            size="sm"
            class="flex-shrink-0"
          />
          <span>通知管理</span>
        </router-link>
        <router-link
          v-if="canViewAuditLog"
          to="/audit-logs"
          class="sidebar-link mb-0.5 py-1.5 text-sm"
          :class="{ 'sidebar-link-active': route.path.startsWith('/audit-logs') }"
          @click="$emit('close-mobile')"
        >
          <Icon
            name="document"
            size="sm"
            class="flex-shrink-0"
          />
          <span>审计日志</span>
        </router-link>
      </div>

      <!-- Collapsed: dropdown for extra items -->
      <div
        v-if="collapsed"
        class="sidebar-section"
      >
        <select
          class="sidebar-link sidebar-link-collapsed justify-center w-full"
          @change="handleCommand"
        >
          <option value="">
            更多
          </option>
          <option
            v-for="item in collapsedMenuItems"
            :key="item.path"
            :value="item.path"
          >
            {{ item.label }}
          </option>
        </select>
      </div>
    </nav>

    <!-- Bottom Section -->
    <div class="mt-auto border-t border-gray-100 p-3 dark:border-dark-800">
      <!-- Theme Toggle -->
      <button
        class="sidebar-link mb-2 w-full"
        :class="{ 'sidebar-link-collapsed': collapsed }"
        :title="collapsed ? (isDark ? '亮色模式' : '暗色模式') : undefined"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          class="h-5 w-5 flex-shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
        <span
          class="sidebar-label"
          :class="{ 'sidebar-label-collapsed': collapsed }"
          :aria-hidden="collapsed ? 'true' : 'false'"
        >
          {{ isDark ? '亮色模式' : '暗色模式' }}
        </span>
      </button>

      <!-- Collapse Button -->
      <button
        class="sidebar-link w-full"
        :class="{ 'sidebar-link-collapsed': collapsed }"
        :title="collapsed ? '展开' : '收起'"
        @click="$emit('toggle-collapse')"
      >
        <svg
          v-if="!collapsed"
          class="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
          />
        </svg>
        <span
          class="sidebar-label"
          :class="{ 'sidebar-label-collapsed': collapsed }"
          :aria-hidden="collapsed ? 'true' : 'false'"
        >收起</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <transition name="fade">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="$emit('close-mobile')"
    />
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/components/common'
import { useUserStore, useUIStore } from '@/stores'
import { branding } from '@/config/branding'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-collapse', 'close-mobile'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()

const isDark = computed(() => uiStore.theme === 'dark')

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

// 新增缺漏的权限变量
const canViewWorkOrderTask = computed(() => userStore.hasPermission('workorder.view_workordertask'))
const canViewStock = computed(() => userStore.hasPermission('workorder.view_productstock'))
const canViewStockIn = computed(() => userStore.hasPermission('workorder.view_stockin'))
const canViewStockOut = computed(() => userStore.hasPermission('workorder.view_stockout'))
const canViewDelivery = computed(() => userStore.hasPermission('workorder.view_deliveryorder'))
const canViewQuality = computed(() => userStore.hasPermission('workorder.view_qualityinspection'))
const canViewInvoice = computed(() => userStore.hasPermission('workorder.view_invoice'))
const canViewPayment = computed(() => userStore.hasPermission('workorder.view_payment'))
const canViewPaymentPlan = computed(() => userStore.hasPermission('workorder.view_paymentplan'))
const canViewCostCenter = computed(() => userStore.hasPermission('workorder.view_costcenter'))
const canViewCostItem = computed(() => userStore.hasPermission('workorder.view_costitem'))
const canViewCost = computed(() => userStore.hasPermission('workorder.view_productioncost'))
const canViewStatement = computed(() => userStore.hasPermission('workorder.view_statement'))
const canViewTaskRule = computed(() => userStore.hasPermission('workorder.view_taskassignmentrule'))
const canViewSystemNotification = computed(() => userStore.hasPermission('workorder.view_systemnotificationsettings'))

// 主要导航项
const mainNavItems = [
  { path: '/dashboard', label: '工作台', icon: 'home' },
  { path: '/workorders', label: '施工单', icon: 'document' }
]

// Collapsed menu items
const collapsedMenuItems = computed(() => {
  const items = []
  if (canViewWorkOrderTask.value) items.push({ path: '/tasks', label: '任务列表' })
  if (canViewStock.value) items.push({ path: '/inventory/stocks', label: '成品库存' })
  if (canViewPayment.value) items.push({ path: '/finance/payments', label: '收款管理' })
  if (canViewCustomer.value) items.push({ path: '/customers', label: '客户管理' })
  if (canViewSupplier.value) items.push({ path: '/suppliers', label: '供应商管理' })
  return items
})

// 路由激活判断
const isActiveRoute = (path: any) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path) || route.path === path
}

const toggleTheme = () => {
  uiStore.toggleTheme()
}

const handleCommand = (e: any) => {
  const path = e.target.value
  if (!path) return
  router.push(path)
  emit('close-mobile')
  e.target.value = '' // reset select
}
</script>

<style>
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
