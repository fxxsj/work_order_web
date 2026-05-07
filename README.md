# 印刷施工单跟踪系统 - Web 前端

> Vue 2 + Element UI Web 前端

## 技术栈

- Vue 2.7
- Element UI 2.15
- Vue Router 3
- Vuex 3
- Axios

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build
```

### Docker 部署

```bash
# 单独构建
docker build -t workorder-web .

# 或使用 docker-compose
docker-compose up -d
```

## 环境配置

前端默认连接 `http://localhost:8000/api/v1/` 作为后端 API。

如需修改，创建 `.env.local`:

```env
VUE_APP_API_BASE_URL=http://localhost:8000/api/v1/
```

## 目录结构

```
web/
├── public/            # 静态资源
├── src/
│   ├── api/          # API 接口模块
│   ├── components/   # 公共组件
│   ├── views/        # 页面视图
│   ├── router/       # 路由配置
│   ├── store/        # Vuex 状态
│   └── utils/        # 工具函数
├── nginx.conf        # Nginx 配置
├── Dockerfile
└── docker-compose.yml
```

## 主要功能

- 施工单管理 (CRUD, 审核流程)
- 任务看板与列表
- 客户、产品、物料管理
- 工序与部门管理
- 财务报表
- 库存管理

## 测试

```bash
# 运行单元测试
npm run test:unit

# 运行 ESLint
npm run lint
```

## Nginx 配置

项目包含预配置的 `nginx.conf`:
- Gzip 压缩
- 静态资源缓存 (1年)
- SPA fallback (支持 Vue Router)
- API 代理到后端

## GitHub Actions

- `ci.yml` - ESLint、测试、构建
- `docker.yml` - Docker 镜像构建和发布
