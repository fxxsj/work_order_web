<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>印刷施工单跟踪系统</h2>
        <p>欢迎登录</p>
      </div>

      <el-alert
        v-if="showLoginPrompt"
        title="请先登录"
        type="info"
        :description="loginPromptMessage"
        show-icon
        :closable="true"
        class="login-alert"
        @close="showLoginPrompt = false"
      />

      <el-alert
        v-if="showSuccessAlert"
        title="登录成功"
        type="success"
        description="正在跳转..."
        show-icon
        :closable="false"
        class="login-alert"
      />

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
            :disabled="loading"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            ref="passwordInputRef"
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            :disabled="loading"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
            style="width: 100%;"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <div class="tips">
          <p>提示：首次使用请在后台创建管理员账号</p>
          <p>命令：python manage.py createsuperuser</p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const passwordInputRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码长度至少3位', trigger: 'blur' }
  ]
}

const loading = ref(false)
const showLoginPrompt = ref(false)
const showSuccessAlert = ref(false)
const loginPromptMessage = ref('请登录后继续访问系统')

onMounted(async () => {
  const hasToken = userStore.currentUser?.access_token || userStore.currentUser?.refresh_token
  if (hasToken) {
    try {
      await authAPI.getCurrentUser()
    } catch (error) {
      // 忽略错误
    }
  }

  const redirect = route.query.redirect
  if (redirect) {
    showLoginPrompt.value = true
    if (redirect.includes('/workorders')) {
      loginPromptMessage.value = '您正在访问施工单页面，请先登录'
    } else if (redirect.includes('/tasks')) {
      loginPromptMessage.value = '您正在访问任务页面，请先登录'
    } else if (redirect.includes('/dashboard')) {
      loginPromptMessage.value = '欢迎回来，请登录以继续工作'
    } else {
      loginPromptMessage.value = '请登录后继续访问系统'
    }
  }
})

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) {
    return false
  }

  loading.value = true
  showSuccessAlert.value = false

  try {
    const payload = await authAPI.login(loginForm)

    if (payload && payload.id) {
      userStore.setUser(payload)
      showSuccessAlert.value = true

      setTimeout(() => {
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      }, 800)
    } else {
      handleLoginError('登录失败，请重试')
    }
  } catch (error) {
    let errorMessage = '登录失败'
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        errorMessage = '用户名或密码错误'
      } else if (status === 500) {
        errorMessage = '服务器错误，请稍后重试'
      } else if (status === 403) {
        errorMessage = '账号已被禁用，请联系管理员'
      } else {
        errorMessage = error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.error ||
          '登录失败'
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    handleLoginError(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleLoginError = (message) => {
  ElMessage.error({
    message: message,
    duration: 3000,
  })

  loginForm.password = ''

  nextTick(() => {
    if (passwordInputRef.value && typeof passwordInputRef.value.focus === 'function') {
      passwordInputRef.value.focus()
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.login-alert {
  margin-bottom: 20px;
}

.login-form {
  margin-top: 30px;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.tips p {
  margin: 5px 0;
}
</style>
