import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductSelector from '@/views/product/components/ProductSelector.vue'
import { productAPI } from '@/api/modules'

vi.mock('@/api/modules', () => ({
  productAPI: {
    getList: vi.fn(),
    getDetail: vi.fn()
  }
}))

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

describe('ProductSelector', () => {
  beforeEach(() => {
    vi.mocked(productAPI.getList).mockReset()
    vi.mocked(productAPI.getDetail).mockReset()
  })

  it('keeps the selected product label when the customer list finishes later', async () => {
    const productListRequest = deferred<{ results: any[] }>()
    vi.mocked(productAPI.getList).mockReturnValue(productListRequest.promise)
    vi.mocked(productAPI.getDetail).mockResolvedValue({
      id: 1288,
      name: '喜福包装盒',
      code: 'XF-1288'
    })

    const wrapper = mount(ProductSelector, {
      props: {
        modelValue: 1288,
        customerId: 1
      }
    })

    await flushPromises()
    expect(wrapper.text()).toContain('喜福包装盒 (XF-1288)')

    productListRequest.resolve({
      results: [{ id: 1, name: '列表内产品', code: 'P-001' }]
    })
    await flushPromises()

    expect(wrapper.find('.select-value').text()).toBe('喜福包装盒 (XF-1288)')
  })
})
