/**
 * 服务层统一导出
 *
 * 集中导出所有服务模块，方便组件引用
 */

import taskService from './TaskService'
import workOrderService from './WorkOrderService'
import workOrderFormService from './WorkOrderFormService'
import formValidationService from './FormValidationService'
import permissionService from './PermissionService'
import exportService from './ExportService'

export {
  // 业务服务
  taskService,
  workOrderService,
  workOrderFormService,

  // 功能服务
  formValidationService,
  permissionService,
  exportService
}

export default {
  taskService,
  workOrderService,
  workOrderFormService,
  formValidationService,
  permissionService,
  exportService
}
