/**
 * 优先级常量
 */

export const Priority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

export const PriorityChoices = [
  { value: 'low', label: '低', color: '#67C23A' },
  { value: 'normal', label: '普通', color: '#409EFF' },
  { value: 'high', label: '高', color: '#E6A23C' },
  { value: 'urgent', label: '紧急', color: '#F56C6C' }
]

/**
 * 根据优先级值获取标签
 * @param {string} priority - 优先级值
 * @returns {string} 优先级标签
 */
export function getPriorityLabel(priority: any) {
  const choice = PriorityChoices.find((item: any) => item.value === priority)
  return choice ? choice.label : priority
}

/**
 * 根据优先级值获取颜色
 * @param {string} priority - 优先级值
 * @returns {string} 颜色值
 */
export function getPriorityColor(priority: any) {
  const choice = PriorityChoices.find((item: any) => item.value === priority)
  return choice ? choice.color : '#409EFF'
}

/**
 * 获取优先级排序权重（用于排序）
 * @param {string} priority - 优先级值
 * @returns {number} 排序权重
 */
export function getPriorityWeight(priority: any) {
  const weights = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1
  }
  return (weights as any)[priority] || 2
}
