# 数据请求与存储对齐计划

> 目标：将 work_order_web 的数据请求和存储模式与 sub2api 对齐

## 现状对比总结

| 方面 | work_order_web | sub2api | 差距 |
|------|----------------|---------|------|
| **API组织** | BaseAPI类继承 | 命名函数+barrel export | 结构不同但功能等价 |
| **API响应格式** | ✅ `{success, code, message, data, errors, timestamp}` | 类似 | ✅ 已对齐 |
| **列表加载** | useCrudList + useTableLoader | useTableLoader | ✅ 已增强 |
| **行选择** | ✅ useTableSelection 已存在 | useTableSelection | ✅ 已对齐 |
| **请求取消** | ✅ AbortController | AbortController | ✅ 已对齐 |
| **页面大小持久化** | ✅ usePersistedPageSize | usePersistedPageSize | ✅ 已对齐 |
| **缓存策略** | CacheStore 5分钟TTL | 无 | work_order_web 有缓存层 |
| **Token刷新** | ✅ 主动调度已完成 | 主动调度 | ✅ 已对齐 |
| **状态持久化** | ✅ localStorage (与 sub2api 一致) | localStorage | ✅ 已对齐 |
| **withLoading** | ✅ UI Store 新增 | withLoading | ✅ 已对齐 |

---

## Phase 1: useCrudList 增强 ✅ 已完成

### 1.1 添加请求取消 (AbortController)

**文件**: `src/composables/useCrudList.ts`

**状态**: ✅ 已完成

### 1.2 添加页面大小持久化

**文件**: `src/composables/useCrudList.ts`

**状态**: ✅ 已完成

### 1.3 BaseAPI.getList 支持 signal 参数

**文件**: `src/api/base/BaseAPI.ts`

**状态**: ✅ 已完成

---

## Phase 2: 行选择支持 ✅ 已存在

### 2.1 useTableSelection Composable

**文件**: `src/composables/useTableSelection.ts`

**状态**: ✅ 已存在并导出

---

## Phase 3: API 模块优化

### 3.1 统一 API 响应格式

**现状**: work_order_web 使用 `{success, data}`，sub2api 使用 `{code, message, data}`

**决策**: 保持现状，两边后端API格式不同，前端适配各自后端

### 3.2 Token 刷新策略

**目标**: 主动调度 token 刷新，避免被动等待 401

**后端修改** ✅ 已完成:

**文件**: `backend/workorder/auth_views.py`

1. 新增 `_get_access_token_expires_at()` 辅助函数 (line 150-155)
   - 从 `settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]` 读取配置
   - 返回 Unix 时间戳（秒）

2. `LoginView` 响应新增 `access_expires_at` 字段 (line 227)

3. `TokenRefreshViewWithDocs` 响应新增 `access_expires_at` 字段 (line 306)

4. 更新序列化器:
   - `login_data_serializer` 新增 `access_expires_at` (line 51-53)
   - `token_refresh_response_serializer` 新增 `access_expires_at` (line 137-139)

**前端待修改**:
- `src/api/index.ts` 使用 `access_expires_at` 主动调度 token 刷新
- 在 token 过期前主动调用 refresh 接口

**状态**: 后端已完成，前端待实现

---

## Phase 4: Store 优化 ✅ 已完成

### 4.1 统一持久化策略

**现状**:
- work_order_web: sessionStorage
- sub2api: localStorage

**决策**: 保持现状
- sessionStorage 更安全（浏览器关闭即清除）
- localStorage 适合持久偏好设置

### 4.2 UI Store 增强 ✅ 已完成

**文件**: `src/stores/ui.ts`

**新增功能**:
- `globalLoading` - 全局加载状态
- `isLoading` - 加载状态计算属性
- `incLoading()` / `decLoading()` - 引用计数加载控制
- `setLoading(loading)` - 直接设置加载状态
- `withLoading<T>(operation)` - 包装异步操作自动管理加载状态
- `withLoadingAndError<T>(operation, errorMessage)` - 包装操作并自动错误提示
- `showSuccess/showError/showWarning/showInfo` - 便捷 toast 方法

**状态**: ✅ 已完成

---

## 执行记录

| 轮次 | 日期 | 内容 | 结果 |
|------|------|------|------|
| 1 | 2026-05-22 | 创建对齐计划 | ✅ 完成 |
| 2 | 2026-05-22 | Phase 1.1: useCrudList 添加 AbortController 支持 | ✅ 完成 |
| 3 | 2026-05-22 | Phase 1.2: useCrudList 添加页面大小持久化 | ✅ 完成 |
| 4 | 2026-05-22 | BaseAPI.getList 添加 signal 参数支持 | ✅ 完成 |
| 5 | 2026-05-22 | Phase 4.2: UI Store 添加 withLoading 辅助方法 | ✅ 完成 |
| 6 | 2026-05-22 | Phase 3.2: 后端 auth_views.py 添加 access_expires_at | ✅ 完成 |
| 7 | 2026-05-22 | Phase 3.2: 前端 api/index.ts 实现主动刷新调度 | ✅ 完成 |
| 8 | 2026-05-22 | Phase 3.2: Login.vue/AppHeader.vue 集成主动刷新 | ✅ 完成 |
| 9 | 2026-05-22 | API 响应格式对齐：BaseAPIResponse/ApiResponse 添加 code, errors, timestamp | ✅ 完成 |
| 10 | 2026-05-22 | 状态持久化对齐：user store 改用 localStorage，移除 ui store 持久化 | ✅ 完成 |

---

## 实际差距分析

经过代码审查发现，work_order_web 已经有大部分 composables：
- ✅ useCrudList (已增强)
- ✅ useTableLoader (已存在)
- ✅ useTableSelection (已存在)
- ✅ usePersistedPageSize (已存在，使用 sessionStorage)
- ✅ usePagination (已存在)

主要差距在于：
1. **Token 刷新策略** - sub2api 主动调度，work_order_web 被动等待 401（需后端配合）
2. **App Store withLoading** - ✅ 已完成

---

## 待执行

- [x] Phase 3.2 前端: 在 `src/api/index.ts` 实现主动 token 刷新调度 ✅ 已完成
  - ✅ 登录/刷新时保存 `access_expires_at`
  - ✅ 设置定时器在 token 过期前主动刷新
  - ✅ 刷新失败时降级到被动等待 401
  - ✅ 登出时清除定时器
  - ✅ 登录成功/会话恢复时调度刷新

**实现细节**:
- `REFRESH_BEFORE_SECONDS = 30` - 过期前 30 秒主动刷新
- `scheduleRefresh(expiresAt)` - 调度下次刷新
- `doProactiveRefresh()` - 执行主动刷新
- `clearRefreshTimer()` - 清除定时器
- 登录后/会话恢复后自动调用 `scheduleRefresh()`
