import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImageManager from '@/components/common/ImageManager.vue'
import { useUIStore } from '@/stores/ui'

const makeFile = (name: string, size: number, type = 'image/jpeg') => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const mountManager = (props = {}) => {
  const api = {
    getImages: vi.fn(),
    uploadImage: vi.fn().mockResolvedValue({ id: 2, image: '/media/demo.jpg' }),
    deleteImage: vi.fn().mockResolvedValue({})
  }
  const wrapper = mount(ImageManager, {
    attachTo: document.body,
    props: {
      api,
      resourceId: 1,
      images: [],
      ...props
    },
    global: {
      stubs: {
        Teleport: true,
        Transition: false
      }
    }
  })
  return { wrapper, api }
}

beforeEach(() => {
  document.body.innerHTML = ''
  setActivePinia(createPinia())
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn()
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn()
  })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

describe('ImageManager', () => {
  it('renders empty state and upload helper', () => {
    mountManager({ emptyText: '暂无产品图片' })

    expect(document.body.textContent).toContain('暂无产品图片')
    expect(document.body.textContent).toContain('单张不超过 10MB')
  })

  it('disables upload when max count is reached', () => {
    mountManager({
      maxCount: 1,
      images: [{ id: 1, image: '/media/a.jpg' }]
    })

    const button = document.body.querySelector('button.btn') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(document.body.textContent).toContain('最多上传 1 张图片')
  })

  it('rejects unsupported extensions before API upload', async () => {
    const { wrapper, api } = mountManager()
    const uiStore = useUIStore()
    const warningSpy = vi.spyOn(uiStore, 'showWarning')
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [makeFile('demo.txt', 100, 'text/plain')]
    })
    await input.trigger('change')

    expect(api.uploadImage).not.toHaveBeenCalled()
    expect(warningSpy).toHaveBeenCalled()
  })

  it('rejects oversized files before API upload', async () => {
    const { wrapper, api } = mountManager({ maxSizeBytes: 10 })
    const uiStore = useUIStore()
    const warningSpy = vi.spyOn(uiStore, 'showWarning')
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [makeFile('demo.jpg', 100)]
    })
    await input.trigger('change')

    expect(api.uploadImage).not.toHaveBeenCalled()
    expect(warningSpy).toHaveBeenCalledWith('图片不能超过 1MB')
  })

  it('uploads valid image and emits changed', async () => {
    const { wrapper, api } = mountManager()
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [makeFile('demo.jpg', 100)]
    })
    await input.trigger('change')

    expect(api.uploadImage).toHaveBeenCalled()
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })

  it('stores pending image when resource id is missing and pending mode is enabled', async () => {
    const { wrapper, api } = mountManager({
      resourceId: null,
      allowPending: true
    })
    const file = makeFile('pending.jpg', 100)
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [file]
    })
    await input.trigger('change')

    expect(api.uploadImage).not.toHaveBeenCalled()
    expect(wrapper.emitted('pending-change')?.[0]).toEqual([[file]])
    expect(document.body.textContent).toContain('待上传')
  })

  it('removes pending image without calling delete API', async () => {
    const { wrapper, api } = mountManager({
      resourceId: null,
      allowPending: true
    })
    const file = makeFile('pending.jpg', 100)
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [file]
    })
    await input.trigger('change')

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')

    expect(api.deleteImage).not.toHaveBeenCalled()
    expect(wrapper.emitted('pending-change')?.at(-1)).toEqual([[]])
  })

  it('does not emit changed when upload response is invalid', async () => {
    const { wrapper, api } = mountManager()
    api.uploadImage.mockResolvedValueOnce({ success: true, data: {} })
    const uiStore = useUIStore()
    const errorSpy = vi.spyOn(uiStore, 'showError')
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [makeFile('demo.jpg', 100)]
    })
    await input.trigger('change')

    expect(api.uploadImage).toHaveBeenCalled()
    expect(wrapper.emitted('changed')).toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith('图片上传失败')
  })

  it('confirms before deleting an image', async () => {
    const { wrapper, api } = mountManager({
      images: [{ id: 5, image: '/media/a.jpg' }]
    })
    const uiStore = useUIStore()
    vi.spyOn(uiStore, 'confirm').mockResolvedValue(true)

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')

    expect(api.deleteImage).toHaveBeenCalledWith(1, 5)
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })
})
