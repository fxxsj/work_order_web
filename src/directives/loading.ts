import type { DirectiveBinding, ObjectDirective } from 'vue'

const loadingInstances = new WeakMap<HTMLElement, HTMLElement>()

interface LoadingBindingValue {
  text?: string
}

function createLoadingElement(binding: DirectiveBinding<boolean | string | LoadingBindingValue>): HTMLElement {
  const isFullscreen = binding.modifiers?.fullscreen || binding.arg === 'fullscreen'
  const text =
    typeof binding.value === 'string'
      ? binding.value
      : (binding.value as LoadingBindingValue)?.text || ''

  const el = document.createElement('div')
  el.className = 'el-loading-mask'
  el.style.cssText = `
    position: ${isFullscreen ? 'fixed' : 'absolute'};
    inset: 0;
    z-index: 2000;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
  `

  const spinner = document.createElement('div')
  spinner.className = 'spinner'
  spinner.style.cssText = `
    width: 30px;
    height: 30px;
    border: 2px solid #e5e7eb;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `
  el.appendChild(spinner)

  if (text) {
    const textEl = document.createElement('p')
    textEl.textContent = text
    textEl.style.cssText = 'margin-top: 8px; font-size: 12px; color: #6b7280;'
    el.appendChild(textEl)
  }

  // Add keyframes if not present
  if (!document.getElementById('el-loading-keyframes')) {
    const style = document.createElement('style')
    style.id = 'el-loading-keyframes'
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
  }

  return el
}

export const vLoading: ObjectDirective<HTMLElement, boolean | string | LoadingBindingValue> = {
  mounted(el, binding) {
    if (binding.value) {
      const loadingEl = createLoadingElement(binding)
      if (binding.modifiers?.fullscreen || binding.arg === 'fullscreen') {
        document.body.appendChild(loadingEl)
      } else {
        const position = getComputedStyle(el).position
        if (position === 'static') {
          el.style.position = 'relative'
        }
        el.appendChild(loadingEl)
      }
      loadingInstances.set(el, loadingEl)
    }
  },
  updated(el, binding) {
    const existing = loadingInstances.get(el)
    if (binding.value && !existing) {
      const loadingEl = createLoadingElement(binding)
      if (binding.modifiers?.fullscreen || binding.arg === 'fullscreen') {
        document.body.appendChild(loadingEl)
      } else {
        const position = getComputedStyle(el).position
        if (position === 'static') {
          el.style.position = 'relative'
        }
        el.appendChild(loadingEl)
      }
      loadingInstances.set(el, loadingEl)
    } else if (!binding.value && existing) {
      existing.remove()
      loadingInstances.delete(el)
    }
  },
  unmounted(el) {
    const existing = loadingInstances.get(el)
    if (existing) {
      existing.remove()
      loadingInstances.delete(el)
    }
  }
}

export default vLoading
