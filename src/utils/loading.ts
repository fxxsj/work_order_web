/**
 * Element Plus ElLoading compatible API
 */

export const ElLoading = {
  service(options = {}) {
    const text = typeof options === 'string' ? options : (options as any).text || '加载中...'
    const lock = (options as any).lock || false

    // Create a fullscreen overlay
    const existing = document.getElementById('el-loading-shim')
    if (existing) existing.remove()

    const div = document.createElement('div')
    div.id = 'el-loading-shim'
    div.style.cssText = `
      position: ${lock ? 'fixed' : 'absolute'};
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${(options as any).background || 'rgba(0,0,0,0.5)'};
    `
    div.innerHTML = `
      <div style="text-align:center;color:#fff;">
        <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
        <div>${text}</div>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `
    if (lock) {
      document.body.appendChild(div)
    } else if ((options as any).target) {
      const target = typeof (options as any).target === 'string'
        ? document.querySelector((options as any).target)
        : (options as any).target
      if (target) {
        target.style.position = 'relative'
        target.appendChild(div)
      }
    } else {
      document.body.appendChild(div)
    }

    return {
      close() {
        const el = document.getElementById('el-loading-shim')
        if (el) el.remove()
      }
    }
  }
}

export default ElLoading
