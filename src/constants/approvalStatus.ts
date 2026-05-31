/**
 * 审批状态常量
 *
 * 与后端 ApprovalFieldsMixin.choices 对齐：draft / submitted / approved / rejected
 * 注意：后端数据库不存储 'pending'，提交审核后值为 'submitted'
 */

export const ApprovalStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const ApprovalStatusChoices = [
  { value: 'draft', label: '草稿', color: '#909399' },
  { value: 'submitted', label: '待审核', color: '#E6A23C' },
  { value: 'approved', label: '已审核', color: '#67C23A' },
  { value: 'rejected', label: '已拒绝', color: '#F56C6C' }
]

/**
 * 根据状态值获取标签
 * @param {string} status - 状态值
 * @returns {string} 状态标签
 */
export function getApprovalStatusLabel(status: any) {
  const choice = ApprovalStatusChoices.find((item: any) => item.value === status)
  return choice ? choice.label : status
}

/**
 * 根据状态值获取颜色
 * @param {string} status - 状态值
 * @returns {string} 颜色值
 */
export function getApprovalStatusColor(status: any) {
  const choice = ApprovalStatusChoices.find((item: any) => item.value === status)
  return choice ? choice.color : '#E6A23C'
}
