<template>
  <div class="p-5">
    <!-- 表格骨架屏 -->
    <div
      v-if="type === 'table'"
      class="space-y-4"
    >
      <div
        v-for="i in rows"
        :key="i"
        class="flex animate-pulse"
      >
        <div
          v-for="j in columns"
          :key="j"
          class="skeleton h-5 mr-4 rounded"
          :style="{ width: getColumnWidth(j) }"
        />
      </div>
    </div>

    <!-- 卡片骨架屏 -->
    <div
      v-else-if="type === 'card'"
      class="space-y-4"
    >
      <div
        v-for="i in rows"
        :key="i"
        class="card p-5 animate-pulse"
      >
        <div class="skeleton h-28 w-full rounded-xl mb-4" />
        <div class="space-y-2">
          <div
            class="skeleton h-4 rounded"
            style="width: 60%"
          />
          <div
            class="skeleton h-4 rounded"
            style="width: 80%"
          />
          <div
            class="skeleton h-4 rounded"
            style="width: 40%"
          />
        </div>
      </div>
    </div>

    <!-- 列表骨架屏 -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="i in rows"
        :key="i"
        class="flex items-center gap-4 animate-pulse"
      >
        <div class="skeleton h-10 w-10 rounded-full flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div
            class="skeleton h-4 rounded"
            style="width: 70%"
          />
          <div
            class="skeleton h-4 rounded"
            style="width: 50%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    default: 'list',
    validator: value => ['table', 'card', 'list'].includes(value as string)
  },
  rows: { type: Number, default: 5 },
  columns: { type: Number, default: 4 },
  columnWidths: { type: Array as any, default: () => [] }
})

const getColumnWidth = (index: any) => {
  if (props.columnWidths && props.columnWidths[index - 1]) {
    return props.columnWidths[index - 1]
  }
  return `${100 / props.columns}%`
}
</script>
