<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: () => ({}) }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const statItems = computed(() => [
  { key: 'total', label: '总任务数', value: props.stats.total, format: 'number', iconName: 'document', tone: 'primary' },
  { key: 'pending', label: '待开始', value: props.stats.pending, format: 'number', iconName: 'clock', tone: 'info' },
  { key: 'in-progress', label: '进行中', value: props.stats.in_progress, format: 'number', iconName: 'loading', tone: 'warning' },
  { key: 'completed', label: '已完成', value: props.stats.completed, format: 'number', iconName: 'checkCircle', tone: 'success' }
])
</script>
