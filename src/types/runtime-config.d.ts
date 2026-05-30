/**
 * 运行时配置类型声明
 *
 * 由 public/env.js 在应用入口前加载到 window.__APP_CONFIG__
 */

export interface RuntimeAppConfig {
  /** 后端 API 基础地址 */
  API_BASE_URL?: string
  /** WebSocket 地址 */
  WS_BASE_URL?: string
  /** 完整系统名称 */
  APP_NAME?: string
  /** 短标题，用于侧边栏 */
  APP_SHORT_NAME?: string
  /** 登录页标语 */
  APP_TAGLINE?: string
  /** 无图片 Logo 时的 fallback 字符 */
  LOGO_TEXT?: string
  /** Logo 图片 URL */
  LOGO_URL?: string
  /** Favicon URL */
  FAVICON_URL?: string
  /** 环境标识 */
  ENV_NAME?: string
  /** 公司名称，用于版权等场景 */
  COMPANY_NAME?: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeAppConfig
  }
}
