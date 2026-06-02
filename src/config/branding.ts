/**
 * 品牌配置
 *
 * 提供统一的品牌信息，来源合并自 runtime config 和代码默认值。
 * 后端 branding 接口返回后可覆盖这些默认值（第二阶段）。
 */

import { runtimeConfig } from './runtime'

export interface BrandingConfig {
  appName: string
  appShortName: string
  appTagline: string
  logoText: string
  logoUrl: string | null
  copyrightText: string
  companyName: string
}

/** 代码默认值 - 所有字段兜底 */
export const defaultBranding: BrandingConfig = {
  appName: '印刷生产管理系统',
  appShortName: '施工单系统',
  appTagline: '高效管理施工单，提升生产效率',
  logoText: '印',
  logoUrl: null,
  copyrightText: '',
  companyName: ''
}

/** 合并运行时配置与默认值 */
export function resolveBranding(): BrandingConfig {
  return {
    appName: runtimeConfig.APP_NAME || defaultBranding.appName,
    appShortName: runtimeConfig.APP_SHORT_NAME || defaultBranding.appShortName,
    appTagline: runtimeConfig.APP_TAGLINE || defaultBranding.appTagline,
    logoText: runtimeConfig.LOGO_TEXT || defaultBranding.logoText,
    logoUrl: runtimeConfig.LOGO_URL || defaultBranding.logoUrl,
    copyrightText: defaultBranding.copyrightText,
    companyName: runtimeConfig.COMPANY_NAME || defaultBranding.companyName
  }
}

/** 当前品牌配置（同步，用于非响应式场景如 router、service） */
export const branding = resolveBranding()
