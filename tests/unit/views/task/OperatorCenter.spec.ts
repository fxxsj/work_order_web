import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import OperatorCenter from '@/views/task/OperatorCenter.vue'
import { workOrderTaskAPI } from '@/api/modules'

const routerPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush })
}))

vi.mock('@/api/modules', () => ({
  workOrderTaskAPI: {
    getOperatorCenterData: vi.fn(),
    claimTask: vi.fn()
  }
}))

const taskFixture = {
  id: 11,
  status: 'pending',
  status_display: '待开始',
  work_content: '印刷 500 张',
  production_quantity: 500,
  quantity_completed: 120,
  quantity_defective: 3,
  auto_calculate_quantity: false,
  version: 2,
  assigned_department_name: '印刷车间',
  logs: [{ id: 1, content: '更新完成数量' }],
  work_order_process_info: {
    process: { id: 2, name: '印刷', code: 'PRINT' },
    work_order: {
      id: 7,
      order_number: 'WO20260529001',
      customer_name: '测试客户',
      priority: 'high',
      priority_display: '高',
      delivery_date: '2026-06-01'
    }
  }
}

const claimableTaskFixture = {
  ...taskFixture,
  id: 12,
  work_content: '覆膜 300 张',
  quantity_completed: 0,
  assigned_operator: null
}

const makeResponse = () => ({
  my_tasks: [taskFixture],
  claimable_tasks: [claimableTaskFixture],
  summary: {
    my_total: 1,
    my_pending: 1,
    my_in_progress: 0,
    my_completed: 0,
    claimable_count: 1
  },
  meta: {
    my_count: 1,
    my_returned: 1,
    my_limit: 100,
    my_has_more: false,
    claimable_count: 1,
    claimable_returned: 1,
    claimable_limit: 50,
    claimable_has_more: false
  }
})

const makeLimitedResponse = () => ({
  my_tasks: [taskFixture],
  claimable_tasks: [claimableTaskFixture],
  summary: {
    my_total: 3,
    my_pending: 3,
    my_in_progress: 0,
    my_completed: 0,
    claimable_count: 1
  },
  meta: {
    my_count: 3,
    my_returned: 1,
    my_limit: 1,
    my_has_more: true,
    claimable_count: 1,
    claimable_returned: 1,
    claimable_limit: 50,
    claimable_has_more: false
  }
})

const UpdateDialogStub = defineComponent({
  name: 'OperatorTaskUpdateDialog',
  props: {
    visible: Boolean,
    task: { type: Object, default: null },
    initialMode: { type: String, default: 'increment' }
  },
  template: '<div v-if="visible" data-test="update-dialog">{{ initialMode }}</div>'
})

const mountCenter = async () => {
  const wrapper = mount(OperatorCenter, {
    global: {
      stubs: {
        Icon: true,
        StatusTag: true,
        ProgressBar: true,
        TaskRelatedInfo: true,
        TaskLogs: true,
        EmptyState: true,
        OperatorTaskUpdateDialog: UpdateDialogStub
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('OperatorCenter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    routerPush.mockReset()
    vi.mocked(workOrderTaskAPI.getOperatorCenterData).mockResolvedValue(makeResponse())
    vi.mocked(workOrderTaskAPI.claimTask).mockResolvedValue({ detail: '任务认领成功' })
  })

  it('loads operator center data from backend response', async () => {
    const wrapper = await mountCenter()

    expect(workOrderTaskAPI.getOperatorCenterData).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('WO20260529001')
    expect(wrapper.text()).toContain('印刷 500 张')
    expect(wrapper.text()).toContain('测试客户')
    expect(wrapper.text()).toContain('我的待开始')
    expect(wrapper.text()).toContain('可认领')
  })

  it('claims a claimable task and refreshes data', async () => {
    const wrapper = await mountCenter()
    const claimableTab = wrapper.findAll('button').find(button => button.text().includes('可认领'))
    await claimableTab!.trigger('click')

    const claimButton = wrapper.findAll('button').find(button => button.text().trim() === '认领')
    await claimButton!.trigger('click')
    await flushPromises()

    expect(workOrderTaskAPI.claimTask).toHaveBeenCalledWith(12, { notes: '' })
    expect(workOrderTaskAPI.getOperatorCenterData).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('我的任务')
  })

  it('opens update dialog in complete mode from my task action', async () => {
    const wrapper = await mountCenter()
    const completeButton = wrapper.findAll('button').find(button => button.text().includes('完成'))

    await completeButton!.trigger('click')
    await flushPromises()

    const dialog = wrapper.findComponent(UpdateDialogStub)
    expect(dialog.props('visible')).toBe(true)
    expect(dialog.props('initialMode')).toBe('complete')
  })

  it('navigates to work order detail', async () => {
    const wrapper = await mountCenter()
    const orderButton = wrapper.findAll('button').find(button => button.text().includes('施工单'))

    await orderButton!.trigger('click')

    expect(routerPush).toHaveBeenCalledWith('/workorders/7')
  })

  it('passes filter params to operator center query', async () => {
    vi.useFakeTimers()
    const wrapper = await mountCenter()
    const searchInput = wrapper.find('input[type="text"]')

    await searchInput.setValue('WO202605')
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(workOrderTaskAPI.getOperatorCenterData).toHaveBeenLastCalledWith({
      search: 'WO202605'
    })
    vi.useRealTimers()
  })

  it('loads more current tab when backend reports hidden tasks', async () => {
    vi.mocked(workOrderTaskAPI.getOperatorCenterData).mockResolvedValue(makeLimitedResponse())
    const wrapper = await mountCenter()

    expect(wrapper.text()).toContain('已显示 1 / 3 条')

    const loadMoreButton = wrapper.findAll('button').find(button => button.text().includes('加载更多'))
    await loadMoreButton!.trigger('click')
    await flushPromises()

    expect(workOrderTaskAPI.getOperatorCenterData).toHaveBeenLastCalledWith({
      my_limit: 3
    })
  })
})
