# Vue 3 迁移计划

> 工作订单系统 Web 前端从 Vue 2 升级到 Vue 3 的详细计划

## 当前状态

| 项目 | 状态 | 说明 |
|------|------|------|
| main 分支 | Vue 2 生产运行 | 保持稳定 |
| vue3-migration 分支 | Vue 3 开发中 | 新技术栈基础设施就绪 |

---

## 迁移范围

### 技术栈变更

| 项目 | 当前 | 目标 |
|------|------|------|
| Vue | 2.7 | 3.4+ |
| 构建工具 | Webpack (@vue/cli) | Vite 5 |
| 状态管理 | Vuex | Pinia |
| 路由 | Vue Router 3 | Vue Router 4 |
| UI 组件 | Element UI 2.15 | Element Plus 2.x |

### 文件统计

| 类型 | 数量 | 优先级 |
|------|------|--------|
| Vue 页面 | 123 | 高 |
| Mixins | 6 | 中 |
| 业务组件 | ~30 | 中 |
| API 模块 | 27 | 低 (已兼容) |

---

## 迁移阶段

### Phase 1: 基础设施 (已完成 ✅)

- [x] Vite 配置
- [x] Vue Router 4 配置
- [x] Pinia Stores (6个)
- [x] Composables (4个)
- [x] Element Plus 集成

**分支提交**: `chore: Vue 3 基础设施`

---

### Phase 2: 核心页面 (1-2天)

| 页面 | 复杂度 | 预计时间 | 状态 |
|------|--------|----------|------|
| Layout.vue | 高 | 4h | ⬜ |
| Login.vue | 低 | 1h | ⬜ |
| Dashboard.vue | 中 | 2h | ⬜ |
| Profile.vue | 中 | 2h | ⬜ |

**目标**: 确保登录 → 首页 → 导航 → 退出 的完整流程可用

---

### Phase 3: CRUD List 页面 (3-5天)

| 页面 | 预计时间 |
|------|----------|
| CustomerList | 2h |
| ProductList | 2h |
| MaterialList | 2h |
| ProcessList | 1h |
| DepartmentList | 1h |
| SupplierList | 1h |
| ArtworkList | 2h |
| DieList | 2h |
| SalesOrderList | 3h |
| PurchaseOrderList | 2h |
| InvoiceList | 1h |
| PaymentList | 1h |
| 其他 | 4h |

**目标**: 80% 的列表查看功能可用

---

### Phase 4: Detail/Form 页面 (1-2周)

| 页面 | 复杂度 | 预计时间 |
|------|--------|----------|
| WorkOrderDetail | 极高 | 4h |
| WorkOrderForm | 极高 | 4h |
| SalesDetail | 高 | 3h |
| SalesForm | 高 | 3h |
| 任务相关页面 (TaskList, Board 等) | 高 | 8h |
| 其他 Detail 页面 | 中 | 2h/个 |

---

### Phase 5: 组件和 Mixin 适配 (3-5天)

| 项目 | 说明 |
|------|------|
| Mixins → Composables | 6 个 mixin 需要转换为 composable 或保留兼容 |
| Element Plus 组件名变更 | 如 `el-icon-*` → `@element-plus/icons-vue` |
| Dialog/Select 等 API 变化 | 部分组件的 show/visible 属性变化 |

---

### Phase 6: 测试和上线 (1周)

- [ ] 完整功能测试
- [ ] 权限流程测试
- [ ] 性能测试
- [ ] 与后端联调
- [ ] 上线部署

---

## 迁移规范

### Vue 2 → Vue 3 写法对照

```javascript
// === data() ===
// Vue 2
data() {
  return { count: 0 }
}

// Vue 3
const count = ref(0)

// === computed ===
// Vue 2
computed: {
  doubled() { return this.count * 2 }
}

// Vue 3
const doubled = computed(() => count.value * 2)

// === methods ===
// Vue 2
methods: {
  increment() { this.count++ }
}

// Vue 3
const increment = () => { count.value++ }

// === this.$xxx ===
// Vue 2
this.$message.success('Hi')
this.$store.getters['user/currentUser']
this.$router.push('/home')
this.$refs.form.validate()

// Vue 3
import { ElMessage } from 'element-plus'
ElMessage.success('Hi')

// store
const userStore = useUserStore()
userStore.currentUser

// router
const router = useRouter()
router.push('/home')

// refs - 模板中仍用 $refs，但 script 中用 ref
const formRef = ref(null)
formRef.value.validate()

// === lifecycle ===
// Vue 2
mounted() { }
created() { }

// Vue 3
onMounted(() => { })
onCreated(() => { })
```

### Element Plus 变化

```javascript
// === Icons ===
// Vue 2
<el-button icon="el-icon-plus">

// Vue 3
<el-button :icon="Plus">
import { Plus } from '@element-plus/icons-vue'

// === Message ===
// Vue 2
this.$message.success('Hi')

// Vue 3
import { ElMessage } from 'element-plus'
ElMessage.success('Hi')
```

---

## 开发流程

### 每日提交规范

```
feat: 迁移 CustomerList 到 Vue 3
fix: 修复 Login 页面 router 跳转问题
chore: 添加 usePagination composable
```

### 测试清单

- [ ] 登录/登出流程
- [ ] 菜单权限显示
- [ ] 列表查询/筛选/分页
- [ ] 创建/编辑表单
- [ ] 删除确认
- [ ] 分页导航
- [ ] 通知消息显示

---

## 时间线

| 周次 | 任务 |
|------|------|
| 第1周 | Phase 1-2 (基础设施 + 核心页面) |
| 第2-3周 | Phase 3 (List 页面批量) |
| 第4-5周 | Phase 4 (Detail/Form 页面) |
| 第6周 | Phase 5 (组件和 Mixin) |
| 第7-8周 | Phase 6 (测试和上线) |

**预计总工期: 6-8 周**

---

## 回滚方案

如果迁移遇到重大问题：
1. `git checkout main` 切回 Vue 2 版本
2. `vue3-migration` 分支保留，修复后继续

---

## 成功标准

- [ ] `npm run build` 成功
- [ ] `npm run dev` 开发服务器正常
- [ ] 所有功能页面可访问
- [ ] 权限流程正常工作
- [ ] 与后端 API 正常交互
- [ ] 性能优于 Vue 2 版本
