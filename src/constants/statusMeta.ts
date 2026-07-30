export const StatusMetaMaps = {
  workOrder: {
    draft: { text: '草稿', type: 'info' },
    submitted: { text: '待审核', type: 'primary' },
    approved: { text: '已审核', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
    pending: { text: '待开始', type: 'info' },
    in_progress: { text: '进行中', type: 'primary' },
    paused: { text: '已暂停', type: 'warning' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'danger' }
  },
  task: {
    draft: { text: '草稿', type: 'info' },
    pending: { text: '待开始', type: 'info' },
    in_progress: { text: '进行中', type: 'primary' },
    completed: { text: '已完成', type: 'success' },
    skipped: { text: '已跳过', type: 'info' },
    cancelled: { text: '已取消', type: 'danger' }
  },
  taskType: {
    plate_making: { text: '制版', type: 'success' },
    cutting: { text: '裁切', type: 'info' },
    printing: { text: '印刷', type: 'primary' },
    foiling: { text: '烫金', type: 'warning' },
    embossing: { text: '击凸', type: 'warning' },
    die_cutting: { text: '模切', type: 'warning' },
    packaging: { text: '包装', type: 'info' },
    general: { text: '通用', type: 'info' }
  },
  assignmentAction: {
    assign: { text: '分派', type: 'success' },
    unassign: { text: '取消分派', type: 'warning' },
    transfer: { text: '转交', type: 'primary' },
    complete: { text: '完成', type: 'info' }
  },
  process: {
    draft: { text: '草稿', type: 'warning' },
    pending: { text: '待开始', type: 'info' },
    in_progress: { text: '进行中', type: 'primary' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'danger' }
  },
  salesOrder: {
    pending: { text: '待处理', type: 'info' },
    draft: { text: '草稿', type: 'info' },
    submitted: { text: '已提交', type: 'primary' },
    approved: { text: '已审核', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
    in_production: { text: '生产中', type: 'warning' },
    ready_to_deliver: { text: '待送货', type: 'primary' },
    partially_delivered: { text: '部分送货', type: 'warning' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' }
  },
  payment: {
    unpaid: { text: '未付款', type: 'danger' },
    partial: { text: '部分付款', type: 'warning' },
    paid: { text: '已付款', type: 'success' }
  },
  materialPurchase: {
    pending: { text: '待采购', type: 'info' },
    ordered: { text: '已下单', type: 'primary' },
    received: { text: '已回料', type: 'success' },
    cut: { text: '已开料', type: 'warning' },
    completed: { text: '已完成', type: 'success' }
  },
  purchaseOrder: {
    pending: { text: '待下单', type: 'info' },
    draft: { text: '草稿', type: 'info' },
    submitted: { text: '已提交', type: 'primary' },
    approved: { text: '已批准', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
    ordered: { text: '已下单', type: 'warning' },
    received: { text: '已收货', type: 'success' },
    cancelled: { text: '已取消', type: 'danger' }
  },
  delivery: {
    pending: { text: '待发货', type: 'info' },
    shipped: { text: '已发货', type: 'primary' },
    in_transit: { text: '运输中', type: 'warning' },
    received: { text: '已签收', type: 'success' },
    rejected: { text: '拒收', type: 'danger' },
    returned: { text: '已退货', type: 'warning' }
  },
  stock: {
    in_stock: { text: '在库', type: 'success' },
    reserved: { text: '已预留', type: 'warning' },
    quality_check: { text: '质检中', type: 'info' },
    defective: { text: '次品', type: 'danger' }
  },
  invoice: {
    draft: { text: '待开具', type: 'info' },
    submitted: { text: '待审核', type: 'primary' },
    approved: { text: '已审核', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
    issued: { text: '已开具', type: 'warning' },
    sent: { text: '已发送', type: 'primary' },
    received: { text: '已收到', type: 'success' },
    cancelled: { text: '已作废', type: 'danger' },
    refunded: { text: '已红冲', type: 'danger' }
  },
  statement: {
    draft: { text: '草稿', type: 'info' },
    sent: { text: '已发送', type: 'warning' },
    confirmed: { text: '已确认', type: 'success' },
    disputed: { text: '有异议', type: 'danger' }
  },
  inspection: {
    pending: { text: '待检', type: 'info' },
    passed: { text: '合格', type: 'success' },
    failed: { text: '不合格', type: 'danger' },
    conditional: { text: '条件接收', type: 'warning' }
  },
  approval: {
    pending: { text: '待审核', type: 'warning' },
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' }
  },
  priority: {
    low: { text: '低', type: 'info' },
    normal: { text: '普通', type: 'primary' },
    high: { text: '高', type: 'warning' },
    urgent: { text: '紧急', type: 'danger' }
  },
  // 客户订单已取消审核流程，用户只看业务状态。
  salesOrderUser: {
    pending: { text: '待处理', type: 'info' },
    approved: { text: '待处理', type: 'info' },
    in_production: { text: '生产中', type: 'warning' },
    ready_to_deliver: { text: '待送货', type: 'primary' },
    partially_delivered: { text: '部分送货', type: 'warning' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' }
  },
  workOrderUser: {
    draft: { text: '草稿', type: 'info' },
    submitted: { text: '待确认', type: 'primary' },
    rejected: { text: '已退回', type: 'danger' },
    pending: { text: '待开始', type: 'info' },
    in_progress: { text: '生产中', type: 'warning' },
    paused: { text: '已暂停', type: 'warning' },
    completed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' }
  },
  taskUser: {
    draft: { text: '草稿', type: 'info' },
    pending: { text: '待开始', type: 'info' },
    in_progress: { text: '进行中', type: 'primary' },
    completed: { text: '已完成', type: 'success' },
    skipped: { text: '已跳过', type: 'info' },
    cancelled: { text: '已取消', type: 'danger' }
  }
}

export function getSalesOrderUserStatus(row: { approval_status?: string; status?: string }): string {
  return row.status || 'pending'
}

export function getWorkOrderUserStatus(row: { approval_status?: string; status?: string }): string {
  if (row.approval_status === 'rejected') return 'rejected'
  if (row.approval_status === 'draft') return 'draft'
  if (row.approval_status === 'submitted') return 'submitted'
  return row.status || 'pending'
}

export function getStatusMeta(category: any, value: any, fallback = {}) {
  const categoryMap = (StatusMetaMaps as any)[category] || {}
  const meta = categoryMap[value] || {}
  return {
    text: (fallback as any).text || meta.text || value || '-',
    type: (fallback as any).type || meta.type || 'info',
    icon: (fallback as any).icon || meta.icon || ''
  }
}

export function getStatusType(category: any, value: any, fallbackType = 'info') {
  return getStatusMeta(category, value, { type: fallbackType }).type
}

export function getStatusText(category: any, value: any, fallbackText = '') {
  return getStatusMeta(category, value, { text: fallbackText }).text
}
