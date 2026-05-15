<template>
  <el-card v-if="title" class="stats-cards-panel">
    <template #header><span>{{ title }}</span></template>
    <div class="stats-cards">
      <el-row :gutter="gutter" class="stats-row">
        <el-col
          v-for="(item, index) in items"
          :key="item.key || `stat-card-${index}`"
          :xs="24"
          :sm="12"
          :md="span"
          :lg="span"
        >
          <el-card :class="['stat-card', layoutClass, item.type]" shadow="never">
            <div v-if="loading" class="stat-skeleton">
              <el-skeleton :rows="2" animated />
            </div>
            <div v-else :class="['stat-item', layoutClass]">
              <div
                v-if="item.icon"
                :class="['stat-icon', `tone-${item.tone || item.type || 'primary'}`]"
              >
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div v-if="layout === 'stacked'" class="stat-label">
                  <el-icon v-if="item.labelIcon"><component :is="item.labelIcon" /></el-icon>
                  {{ item.label }}
                </div>
                <div class="stat-value">
                  <template v-if="item.prefix">
                    {{ item.prefix }}
                  </template>
                  {{ formatValue(item.value, item.format) }}
                  <template v-if="item.suffix">
                    {{ item.suffix }}
                  </template>
                </div>
                <div v-if="layout !== 'stacked'" class="stat-label">
                  {{ item.label }}
                </div>
                <div v-if="item.subtext" class="stat-subtext">
                  {{ item.subtext }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>

  <div v-else class="stats-cards">
    <el-row :gutter="gutter" class="stats-row">
      <el-col
        v-for="(item, index) in items"
        :key="item.key || `stat-card-${index}`"
        :xs="24"
        :sm="12"
        :md="span"
        :lg="span"
      >
        <el-card :class="['stat-card', layoutClass, item.type]" shadow="never">
          <div v-if="loading" class="stat-skeleton">
            <el-skeleton :rows="2" animated />
          </div>
          <div v-else :class="['stat-item', layoutClass]">
            <div
              v-if="item.icon"
              :class="['stat-icon', `tone-${item.tone || item.type || 'primary'}`]"
            >
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div v-if="layout === 'stacked'" class="stat-label">
                <el-icon v-if="item.labelIcon"><component :is="item.labelIcon" /></el-icon>
                {{ item.label }}
              </div>
              <div class="stat-value">
                <template v-if="item.prefix">
                  {{ item.prefix }}
                </template>
                {{ formatValue(item.value, item.format) }}
                <template v-if="item.suffix">
                  {{ item.suffix }}
                </template>
              </div>
              <div v-if="layout !== 'stacked'" class="stat-label">
                {{ item.label }}
              </div>
              <div v-if="item.subtext" class="stat-subtext">
                {{ item.subtext }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  span: { type: Number, default: 6 },
  gutter: { type: Number, default: 20 },
  layout: {
    type: String,
    default: 'stacked',
    validator: (value) => ['stacked', 'media'].includes(value)
  },
  loading: { type: Boolean, default: false }
})

const layoutClass = computed(() => `is-${props.layout}`)

const formatValue = (value, format) => {
  const normalizedValue = value ?? 0
  if (format === 'number') {
    return Number(normalizedValue).toLocaleString()
  }
  if (format === 'currency') {
    return `¥${Number(normalizedValue).toFixed(2)}`
  }
  if (format === 'percent') {
    return `${(Number(normalizedValue) * 100).toFixed(2)}%`
  }
  return normalizedValue
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.stats-cards-panel {
  margin-bottom: var(--ui-section-gap);
}

.stats-cards {
  margin-bottom: var(--ui-section-gap);
}

.stats-cards-panel .stats-cards {
  margin-bottom: 0;
}

.stats-row {
  row-gap: var(--ui-section-gap);
}

.stat-card {
  height: 100%;
  border-radius: var(--ui-radius-card);
}

.stat-item {
  text-align: center;
}

.stat-item.is-media {
  display: flex;
  align-items: center;
  gap: var(--ui-stat-content-gap);
  text-align: left;
}

.stat-info {
  min-width: 0;
}

.stat-label {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-color-text-secondary);
  margin-bottom: var(--ui-control-gap);
}

.stat-item.is-media .stat-label {
  margin-bottom: 0;
  font-size: var(--ui-font-size-xs);
}

.stat-value {
  font-size: var(--ui-stat-icon-font-size);
  font-weight: 700;
  color: var(--ui-color-text-primary);
  overflow-wrap: anywhere;
}

.stat-subtext {
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-secondary);
  margin-top: 5px;
}

.stat-icon {
  width: var(--ui-stat-icon-size);
  height: var(--ui-stat-icon-size);
  border-radius: var(--ui-radius-card);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: var(--ui-stat-icon-font-size);
}

.tone-primary { background-color: var(--ui-color-primary); }
.tone-success { background-color: var(--ui-color-success); }
.tone-warning { background-color: var(--ui-color-warning); }
.tone-danger { background-color: var(--ui-color-danger); }
.tone-info { background-color: var(--ui-color-text-secondary); }

.stat-skeleton {
  min-height: var(--ui-stat-skeleton-height);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .stat-item.is-media {
    min-height: var(--ui-touch-target-min);
  }

  .stat-value {
    font-size: var(--ui-font-size-lg);
  }
}
</style>
