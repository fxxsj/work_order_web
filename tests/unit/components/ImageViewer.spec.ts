import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ImageViewer from '@/components/common/ImageViewer.vue'

const mountViewer = (props = {}) => mount(ImageViewer, {
  attachTo: document.body,
  props: {
    visible: true,
    src: '/media/a.jpg',
    ...props
  },
  global: {
    stubs: {
      Teleport: true,
      Transition: false
    }
  }
})

afterEach(() => {
  document.body.innerHTML = ''
  document.body.classList.remove('modal-open')
})

describe('ImageViewer', () => {
  it('shows the selected image when visible', () => {
    mountViewer()

    const image = document.body.querySelector('img.preview-image') as HTMLImageElement
    expect(document.body.textContent).toContain('图片预览')
    expect(image.getAttribute('src')).toBe('/media/a.jpg')
  })

  it('renders thumbnails for multiple images', () => {
    mountViewer({
      images: [{ src: '/media/a.jpg' }, { src: '/media/b.jpg' }]
    })

    expect(document.body.querySelectorAll('.thumbnail-item')).toHaveLength(2)
  })

  it('emits update:visible when closed', async () => {
    const wrapper = mountViewer()
    const closeButton = document.body.querySelector('button[aria-label="Close modal"]') as HTMLButtonElement

    await closeButton.click()

    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
  })

  it('resets scale when reopened', async () => {
    const wrapper = mountViewer()
    const zoomButton = Array.from(document.body.querySelectorAll('button'))
      .find((button) => button.getAttribute('title') === '放大') as HTMLButtonElement

    await zoomButton.click()
    expect(document.body.textContent).toContain('120%')

    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })

    expect(document.body.textContent).toContain('100%')
  })
})
