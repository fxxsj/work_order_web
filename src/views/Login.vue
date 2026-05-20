<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Title -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          欢迎回来
        </h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
          请登录您的账号
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username Input -->
        <div>
          <label for="username" class="input-label">用户名</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <User class="h-5 w-5 text-gray-400 dark:text-dark-500" />
            </div>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              required
              autocomplete="username"
              :disabled="loading"
              class="input pl-11"
              :class="{ 'input-error': errors.username }"
              placeholder="请输入用户名"
            />
          </div>
          <p v-if="errors.username" class="input-error-hint">{{ errors.username }}</p>
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="input-label">密码</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock class="h-5 w-5 text-gray-400 dark:text-dark-500" />
            </div>
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="loading"
              class="input pl-11 pr-11"
              :class="{ 'input-error': errors.password }"
              placeholder="请输入密码"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-dark-300"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="input-error-hint">{{ errors.password }}</p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="rounded-lg bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-900/20 dark:text-danger-400">
          {{ errorMessage }}
        </div>

        <!-- Success Alert -->
        <div v-if="showSuccessAlert" class="rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-900/20 dark:text-success-400">
          登录成功，正在跳转...
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full"
        >
          <svg
            v-if="loading"
            class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <!-- Tips -->
        <div class="rounded-lg bg-gray-50 p-4 text-xs text-gray-500 dark:bg-dark-800 dark:text-dark-400">
          <p class="mb-1 font-medium text-gray-700 dark:text-dark-300">提示：首次使用请在后台创建管理员账号</p>
          <p>命令：python manage.py createsuperuser</p>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showSuccessAlert = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const hasToken = userStore.currentUser?.access_token || userStore.currentUser?.refresh_token
  if (hasToken) {
    try {
      await authAPI.getCurrentUser()
    } catch (error) {
      // 忽略错误
    }
  }
})

function validateForm() {
  errors.username = ''
  errors.password = ''
  let isValid = true

  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  }

  if (!loginForm.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (loginForm.password.length < 3) {
    errors.password = '密码长度至少3位'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  errorMessage.value = ''
  showSuccessAlert.value = false

  if (!validateForm()) {
    return
  }

  loading.value = true

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
      throw new Error('登录失败，请重试')
    }
  } catch (error) {
    let message = '登录失败'
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        message = '用户名或密码错误'
      } else if (status === 500) {
        message = '服务器错误，请稍后重试'
      } else if (status === 403) {
        message = '账号已被禁用，请联系管理员'
      } else {
        message = error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.error ||
          '登录失败'
      }
    } else if (error.message) {
      message = error.message
    }

    errorMessage.value = message
    loginForm.password = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>