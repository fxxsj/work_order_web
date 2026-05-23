/**
 * 持久化页面大小
 * 将用户设置的 page_size 保存到 sessionStorage
 */

const STORAGE_KEY = 'persisted_page_size'
const DEFAULT_PAGE_SIZE = 20

export function getPersistedPageSize(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PAGE_SIZE
    const size = parseInt(raw, 10)
    return Number.isFinite(size) && size > 0 ? size : DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

export function setPersistedPageSize(size: number): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(size))
  } catch {
    // 忽略存储异常
  }
}
