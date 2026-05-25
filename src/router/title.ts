/**
 * 页面标题解析模块
 */

const SITE_NAME = '印刷施工单跟踪系统'

/**
 * 根据页面标题生成 document.title
 * @param title 页面标题
 * @returns 格式: "{title} - {siteName}" 或仅 siteName
 */
export function resolveDocumentTitle(title?: string): string {
  if (!title) return SITE_NAME
  return `${title} - ${SITE_NAME}`
}
