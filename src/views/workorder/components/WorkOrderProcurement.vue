<template>
  <div class="work-order-procurement">
    <div class="detail-section-title card-header">
      <span>采购信息</span>
      <el-button v-if="hasPendingMaterials" size="small" type="primary" :icon="Plus" @click="emit('create-purchase')">
        创建采购单
      </el-button>
    </div>

    <!-- 物料采购状态 -->
    <div v-if="materials?.length" class="section-block">
      <div class="section-label">物料采购状态</div>
      <div class="table-scroll">
        <el-table :data="materials" border size="small">
          <el-table-column label="物料" min-width="200">
            <template #default="scope">
              {{ scope.row.material_name }} ({{ scope.row.material_code }})
            </template>
          </el-table-column>
          <el-table-column prop="material_usage" label="用量" width="100" align="center" />
          <el-table-column label="采购状态" width="120">
            <template #default="scope">
              <StatusTag :status="scope.row.purchase_status" category="materialPurchase" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="采购日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.purchase_date) }}</template>
          </el-table-column>
          <el-table-column label="到货日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.received_date) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 关联采购单 -->
    <div v-if="purchaseOrders?.length" class="section-block">
      <div class="section-label">关联采购单</div>
      <div class="table-scroll">
        <el-table :data="purchaseOrders" border size="small">
          <el-table-column prop="order_number" label="采购单号" width="150">
            <template #default="scope">
              <span class="purchase-link" @click="emit('view-purchase', scope.row.id)">
                {{ scope.row.order_number || scope.row.number }}<el-icon class="link-icon"><ArrowRight /></el-icon>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="supplier_name" label="供应商" width="150" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <StatusTag :status="scope.row.status" category="purchaseOrder" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="right">
            <template #default="scope">
              ¥{{ Number(scope.row.total_amount || 0).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="items_count" label="明细数" width="80" align="center" />
        </el-table>
      </div>
    </div>

    <el-empty v-if="!materials?.length && !purchaseOrders?.length" description="暂无采购信息" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, ArrowRight } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  materials: { type: Array, default: () => [] },
  purchaseOrders: { type: Array, default: () => [] }
})

const emit = defineEmits(['create-purchase', 'view-purchase'])

// 有 pending 状态的物料时可以创建采购单
const hasPendingMaterials = computed(() => {
  return props.materials.some(m => m.purchase_status === 'pending')
})
</script>

<style scoped lang="scss">
.work-order-procurement {
  margin-top: var(--ui-section-gap);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.detail-section-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.section-block {
  margin-bottom: var(--ui-section-gap);
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.table-scroll {
  overflow-x: auto;
}

.purchase-link {
  color: var(--el-color-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  &:hover { text-decoration: underline; }
  .link-icon { font-size: 12px; }
}
</style>