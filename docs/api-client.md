# API Client 约定

## BaseAPI 基类

所有 API 调用统一走 `src/api/` 模块，基于 BaseAPI 基类封装。

## 目录结构

```
src/api/
├── base/
│   └── BaseAPI.ts      # 基类：统一错误处理、认证、超时
├── workorder/
│   └── index.ts        # 施工单相关 API
└── index.ts            # 统一导出
```

## 使用示例

```typescript
import { WorkOrderAPI } from '@/api'

const list = await WorkOrderAPI.getList({ page: 1 })
```

## 错误处理

- HTTP 错误统一在 BaseAPI 拦截器中处理
- 业务错误码由后端定义，前端根据错误码显示对应提示
