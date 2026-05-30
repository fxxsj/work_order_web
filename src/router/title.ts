/**
 * 页面标题解析模块
 */

import { branding } from '@/config/branding'

/**
 * 根据页面标题生成 document.title
 * @param title 页面标题
 * @returns 格式: "{title} - {siteName}" 或仅 siteName
 */
export function resolveDocumentTitle(title?: string): string {
  if (!title) return branding.appName
  return `${title} - ${branding.appName}`
}
