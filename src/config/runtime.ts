/**
 * 运行时配置
 *
 * 合并优先级：env.js (window.__APP_CONFIG__) > import.meta.env > 代码默认值
 */

import type { RuntimeAppConfig } from '@/types/runtime-config.d'

const envConfig = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {} as Partial<RuntimeAppConfig>

function getEnvString(key: string): string | undefined {
  return import.meta.env[key] as string | undefined
}

export const runtimeConfig: Readonly<Required<Pick<RuntimeAppConfig, 'API_BASE_URL'>>> & Readonly<RuntimeAppConfig> = {
  API_BASE_URL: envConfig.API_BASE_URL || getEnvString('VITE_API_BASE_URL') || '/api',
  WS_BASE_URL: envConfig.WS_BASE_URL || getEnvString('VITE_WS_BASE_URL') || undefined,
  APP_NAME: envConfig.APP_NAME || getEnvString('VITE_APP_NAME') || undefined,
  APP_SHORT_NAME: envConfig.APP_SHORT_NAME || getEnvString('VITE_APP_SHORT_NAME') || undefined,
  APP_TAGLINE: envConfig.APP_TAGLINE || getEnvString('VITE_APP_TAGLINE') || undefined,
  LOGO_TEXT: envConfig.LOGO_TEXT || getEnvString('VITE_LOGO_TEXT') || undefined,
  LOGO_URL: envConfig.LOGO_URL || getEnvString('VITE_LOGO_URL') || undefined,
  FAVICON_URL: envConfig.FAVICON_URL || getEnvString('VITE_FAVICON_URL') || undefined,
  ENV_NAME: envConfig.ENV_NAME || getEnvString('VITE_ENV_NAME') || undefined,
  COMPANY_NAME: envConfig.COMPANY_NAME || getEnvString('VITE_COMPANY_NAME') || undefined
}
