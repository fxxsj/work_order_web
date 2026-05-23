/**
 * 异步组件加载工具
 * P2 性能优化 - 组件懒加载
 */

/**
 * 创建异步组件（带加载状态和错误处理）
 * @param {Function} componentLoader - 组件加载函数
 * @param {Object} options - 配置选项
 * @returns {Object} Vue 异步组件配置
 */
export function createAsyncComponent(componentLoader: () => Promise<unknown>, options: Record<string, unknown> = {}) {
  const {
    loadingComponent = null,
    errorComponent = null,
    delay = 200, // 延迟显示加载组件（毫秒）
    timeout = 10000 // 超时时间（毫秒）
  } = options

  return () => ({
    component: componentLoader(),
    loading: loadingComponent,
    error: errorComponent,
    delay,
    timeout
  })
}

/**
 * 创建带骨架屏的异步组件
 * @param {Function} componentLoader - 组件加载函数
 * @param {Object} skeletonComponent - 骨架屏组件
 * @returns {Object} Vue 异步组件配置
 */
export function createSkeletonAsyncComponent(componentLoader: () => Promise<unknown>, skeletonComponent: unknown) {
  return createAsyncComponent(componentLoader, {
    loadingComponent: skeletonComponent,
    delay: 100 // 骨架屏显示更快
  })
}

/**
 * 批量创建异步组件
 * @param {Object} componentMap - 组件映射 { componentName: loader }
 * @returns {Object} 异步组件对象
 */
export function createAsyncComponents(componentMap: Record<string, () => Promise<unknown>>) {
  const asyncComponents: Record<string, unknown> = {}

  for (const [name, loader] of Object.entries(componentMap)) {
    asyncComponents[name] = createAsyncComponent(loader)
  }

  return asyncComponents
}

/**
 * 组件预加载
 * @param {Function} componentLoader - 组件加载函数
 * @returns {Promise} 加载 Promise
 */
export function preloadComponent(componentLoader: () => Promise<unknown>) {
  return componentLoader()
}

/**
 * 预加载多个组件
 * @param {Array<Function>} loaders - 组件加载函数数组
 * @returns {Promise} Promise.all
 */
export function preloadComponents(loaders: Array<() => Promise<unknown>>) {
  return Promise.all(loaders.map(loader => loader()))
}

export default {
  createAsyncComponent,
  createSkeletonAsyncComponent,
  createAsyncComponents,
  preloadComponent,
  preloadComponents
}
