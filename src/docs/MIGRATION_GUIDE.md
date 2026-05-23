# Vue 2 → Vue 3 迁移指南

> 印刷施工单跟踪系统 Web 前端升级文档

## 迁移目标

```
当前: Vue 2 + Vuex + Element UI + Webpack
目标: Vue 3 + Pinia + Element Plus + Vite
```

## 迁移阶段

### Phase 1: 基础设施升级
- [x] 创建 vite.config.js
- [ ] 更新 package.json 依赖
- [ ] 创建 src/stores/ 目录结构
- [ ] 创建 Pinia stores (替代 Vuex)
- [ ] 更新路由配置 (Vue Router 4)
- [ ] 创建新的入口文件

### Phase 2: 组件库迁移
- [ ] 替换 Element UI → Element Plus
- [ ] 更新全局引入方式
- [ ] 处理组件 API 变化
- [ ] 更新插件调用方式 (Message, Notification 等)

### Phase 3: API 和工具层适配
- [ ] 更新 axios 封装 (Composition API)
- [ ] 迁移 Mixin → Composables
- [ ] 更新过滤器 → 全局函数
- [ ] 适配第三方库

### Phase 4: 业务页面迁移
- [ ] Layout / Login 验证
- [ ] 任务相关页面
- [ ] 施工单管理页面
- [ ] 其他页面

## 主要变更点

### 依赖变更

| 旧版本 | 新版本 |
|--------|--------|
| vue@2.7 | vue@3.4+ |
| vuex@3 | pinia@2 |
| vue-router@3 | vue-router@4 |
| element-ui@2.15 | element-plus@2 |
| @vue/cli-service | vite@5 |

### 语法变更

#### 1. 组件选项 → Composition API
```javascript
// Vue 2 (Options API)
export default {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
}

// Vue 3 (Composition API)
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
}
```

#### 2. Vuex → Pinia
```javascript
// Vuex
export default {
  namespaced: true,
  state: { count: 0 },
  mutations: { increment(state) { state.count++ } },
  actions: { asyncIncrement({ commit }) { commit('increment') } }
}

// Pinia
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: { increment() { this.count++ } }
})
```

#### 3. Mixin → Composables
```javascript
// Mixin (Vue 2)
export default {
  methods: {
    formatDate(value) { return value ? dayjs(value).format('YYYY-MM-DD') : '-' }
  }
}

// Composable (Vue 3)
export function useFormatDate() {
  const formatDate = (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
  return { formatDate }
}
```

#### 4. Element UI → Element Plus
```javascript
// Element UI
import { Message } from 'element-ui'
Message.success('成功')

// Element Plus
import { ElMessage } from 'element-plus'
ElMessage.success('成功')
```

## 文件迁移清单

- [ ] vite.config.js (新建)
- [ ] package.json (更新依赖)
- [ ] src/main.js (重写)
- [ ] src/App.vue (适配)
- [ ] src/router/index.js (重写)
- [ ] src/store/index.js → src/stores/index.js (重写)
- [ ] src/store/modules/* → src/stores/*.js (重写)
- [ ] src/mixins/* → src/composables/*.js (重写)

## 注意事项

1. **渐进式迁移**: 可以让 Vue 2 和 Vue 3 代码共存
2. **兼容模式**: 使用 `composition-api` 包可以在 Vue 2 中使用 Composition API
3. **样式隔离**: 需要检查组件样式是否需要调整
4. **第三方库**: 检查是否支持 Vue 3

## 参考资料

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 迁移指南](https://element-plus.org/zh-CN/guide/migration.html)
- [Pinia 官方文档](https://pinia.vuejs.org/)
