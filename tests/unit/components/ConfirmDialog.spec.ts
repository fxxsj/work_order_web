import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const mountDialog = (props = {}, slots = {}) => {
  return mount(ConfirmDialog, {
    attachTo: document.body,
    props: {
      show: true,
      title: '删除确认',
      message: '确定要删除这条记录吗？',
      ...props,
    },
    slots,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.classList.remove('modal-open')
})

describe('ConfirmDialog', () => {
  it('renders title, message, custom labels and default slot content', () => {
    mountDialog(
      {
        confirmText: '删除',
        cancelText: '返回',
      },
      {
        default: '<div data-test="extra">额外说明</div>',
      },
    )

    expect(document.body.textContent).toContain('删除确认')
    expect(document.body.textContent).toContain('确定要删除这条记录吗？')
    expect(document.body.textContent).toContain('额外说明')
    expect(document.body.textContent).toContain('删除')
    expect(document.body.textContent).toContain('返回')
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mountDialog({ confirmText: '删除' })
    const buttons = document.body.querySelectorAll('button')
    const confirmButton = buttons[buttons.length - 1] as HTMLButtonElement

    await confirmButton.click()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel from cancel button and close button', async () => {
    const wrapper = mountDialog({ cancelText: '取消' })
    const buttons = document.body.querySelectorAll('button')
    const closeButton = buttons[0] as HTMLButtonElement
    const cancelButton = buttons[1] as HTMLButtonElement

    await cancelButton.click()
    await closeButton.click()

    expect(wrapper.emitted('cancel')).toHaveLength(2)
  })

  it('uses danger styles for destructive confirmation', () => {
    mountDialog({ danger: true, confirmText: '删除' })
    const buttons = document.body.querySelectorAll('button')
    const confirmButton = buttons[buttons.length - 1] as HTMLButtonElement

    expect(confirmButton.className).toContain('bg-red-600')
  })

  it('disables actions and shows loading text while loading', async () => {
    const wrapper = mountDialog({
      loading: true,
      confirmText: '删除',
      loadingText: '删除中...',
    })
    const buttons = document.body.querySelectorAll('button')
    const cancelButton = buttons[1] as HTMLButtonElement
    const confirmButton = buttons[buttons.length - 1] as HTMLButtonElement

    expect(cancelButton.disabled).toBe(true)
    expect(confirmButton.disabled).toBe(true)
    expect(confirmButton.textContent).toContain('删除中...')

    await confirmButton.click()

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
