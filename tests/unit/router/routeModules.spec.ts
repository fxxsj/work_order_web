/**
 * Route Modules 单元测试
 * 验证各模块路由定义不回退、meta 信息完整
 */

import { describe, it, expect } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'

import { workorderRoutes } from '@/router/modules/workorder'
import { masterDataRoutes } from '@/router/modules/master-data'
import { plateRoutes } from '@/router/modules/plates'
import { procurementRoutes } from '@/router/modules/procurement'
import { salesRoutes } from '@/router/modules/sales'
import { taskRoutes } from '@/router/modules/task'
import { financeRoutes } from '@/router/modules/finance'
import { inventoryRoutes } from '@/router/modules/inventory'

function assertRouteMeta(route: RouteRecordRaw) {
  expect(route.meta).toBeDefined()
  expect(route.meta!.title).toBeTruthy()
  expect(typeof route.meta!.title).toBe('string')
}

function assertRouteAuth(route: RouteRecordRaw) {
  // Most routes require auth; login/404 are exceptions at top level
  if (route.meta?.requiresAuth !== false) {
    expect(route.meta?.requiresAuth).toBe(true)
  }
}

describe('WorkOrder Routes', () => {
  it('should export non-empty routes', () => {
    expect(workorderRoutes.length).toBeGreaterThan(0)
  })

  it('should have list route', () => {
    const list = workorderRoutes.find(r => r.name === 'WorkOrderList')
    expect(list).toBeDefined()
    expect(list!.path).toBe('workorders')
    expect(list!.meta!.title).toBe('施工单列表')
    assertRouteAuth(list!)
  })

  it('should have create route', () => {
    const create = workorderRoutes.find(r => r.name === 'WorkOrderCreate')
    expect(create).toBeDefined()
    expect(create!.path).toBe('workorders/create')
    expect(create!.meta!.title).toBe('新建施工单')
    expect(create!.meta!.requiresPermission).toContain('workorder.add_workorder')
  })

  it('should have detail route', () => {
    const detail = workorderRoutes.find(r => r.name === 'WorkOrderDetail')
    expect(detail).toBeDefined()
    expect(detail!.path).toBe('workorders/:id')
    expect(detail!.meta!.title).toBe('施工单详情')
  })

  it('should have edit route with props', () => {
    const edit = workorderRoutes.find(r => r.name === 'WorkOrderEdit')
    expect(edit).toBeDefined()
    expect(edit!.path).toBe('workorders/:id/edit')
    expect(edit!.props).toBe(true)
    expect(edit!.meta!.title).toBe('编辑施工单')
    expect(edit!.meta!.requiresPermission).toContain('workorder.change_workorder')
  })

  it('should keep view permission on list and detail routes', () => {
    const list = workorderRoutes.find(r => r.name === 'WorkOrderList')
    const detail = workorderRoutes.find(r => r.name === 'WorkOrderDetail')
    expect(list!.meta!.requiresPermission).toContain('workorder.view_workorder')
    expect(detail!.meta!.requiresPermission).toContain('workorder.view_workorder')
  })
})

describe('Master Data Routes', () => {
  it('should have customer route', () => {
    const route = masterDataRoutes.find(r => r.name === 'CustomerList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('客户管理')
  })

  it('should have product route', () => {
    const route = masterDataRoutes.find(r => r.name === 'ProductList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('产品管理')
  })

  it('should have material route', () => {
    const route = masterDataRoutes.find(r => r.name === 'MaterialList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('物料管理')
  })
})

describe('Plate Routes', () => {
  it('should have artwork route', () => {
    const route = plateRoutes.find(r => r.name === 'ArtworkList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('图稿管理')
  })

  it('should have die route', () => {
    const route = plateRoutes.find(r => r.name === 'DieList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('刀模管理')
  })
})

describe('Procurement Routes', () => {
  it('should have supplier route', () => {
    const route = procurementRoutes.find(r => r.name === 'SupplierList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('供应商管理')
  })

  it('should have purchase order list route', () => {
    const route = procurementRoutes.find(r => r.name === 'PurchaseOrderList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('采购订单管理')
    expect(route!.meta!.requiresPermission).toContain('workorder.view_purchaseorder')
  })

  it('should have purchase order create route requiring add permission', () => {
    const route = procurementRoutes.find(r => r.name === 'PurchaseOrderCreate')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('新建采购订单')
    expect(route!.meta!.requiresPermission).toContain('workorder.add_purchaseorder')
  })
})

describe('Sales Routes', () => {
  it('should have sales order list route', () => {
    const route = salesRoutes.find(r => r.name === 'SalesOrderList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('客户订单管理')
  })

  it('should have sales create route', () => {
    const route = salesRoutes.find(r => r.name === 'SalesOrderCreate')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('新建客户订单')
    expect(route!.meta!.requiresPermission).toContain('workorder.add_salesorder')
  })

  it('should have sales edit route requiring change permission', () => {
    const route = salesRoutes.find(r => r.name === 'SalesOrderEdit')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('编辑客户订单')
    expect(route!.meta!.requiresPermission).toContain('workorder.change_salesorder')
  })
})

describe('Task Routes', () => {
  it('should have task list route', () => {
    const route = taskRoutes.find(r => r.name === 'TaskList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('任务管理')
  })

  it('should have operator center route', () => {
    const route = taskRoutes.find(r => r.name === 'OperatorCenter')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('操作员任务中心')
  })

  it('should have supervisor dashboard route', () => {
    const route = taskRoutes.find(r => r.name === 'SupervisorDashboard')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('主管看板')
  })
})

describe('Finance Routes', () => {
  it('should have invoice route', () => {
    const route = financeRoutes.find(r => r.name === 'InvoiceList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('发票管理')
  })

  it('should have payment route', () => {
    const route = financeRoutes.find(r => r.name === 'PaymentList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('收款管理')
  })

  it('should have cost route', () => {
    const route = financeRoutes.find(r => r.name === 'CostList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('成本核算')
  })
})

describe('Inventory Routes', () => {
  it('should have stock route', () => {
    const route = inventoryRoutes.find(r => r.name === 'StockList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('成品库存')
  })

  it('should have delivery route', () => {
    const route = inventoryRoutes.find(r => r.name === 'DeliveryList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('发货管理')
  })

  it('should have delivery create route', () => {
    const route = inventoryRoutes.find(r => r.name === 'DeliveryCreate')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('新建送货单')
    expect(route!.meta!.requiresPermission).toContain('workorder.add_deliveryorder')
  })

  it('should have delivery edit route', () => {
    const route = inventoryRoutes.find(r => r.name === 'DeliveryEdit')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('编辑送货单')
    expect(route!.meta!.requiresPermission).toContain('workorder.change_deliveryorder')
  })

  it('should have quality route', () => {
    const route = inventoryRoutes.find(r => r.name === 'QualityList')
    expect(route).toBeDefined()
    expect(route!.meta!.title).toBe('质量检验')
  })
})

describe('All route modules', () => {
  const allRoutes = [
    ...workorderRoutes,
    ...masterDataRoutes,
    ...plateRoutes,
    ...procurementRoutes,
    ...salesRoutes,
    ...taskRoutes,
    ...financeRoutes,
    ...inventoryRoutes,
  ]

  it('every route should have a name', () => {
    allRoutes.forEach(route => {
      expect(route.name).toBeTruthy()
    })
  })

  it('every route should have meta.title', () => {
    allRoutes.forEach(route => {
      assertRouteMeta(route)
    })
  })

  it('every route should have requiresAuth', () => {
    allRoutes.forEach(route => {
      assertRouteAuth(route)
    })
  })

  it('routes should not have leading slash in path (child routes)', () => {
    allRoutes.forEach(route => {
      expect(route.path.startsWith('/')).toBe(false)
    })
  })
})
