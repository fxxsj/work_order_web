<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <!-- 个人信息卡片 -->
    <div class="card overflow-hidden border border-primary-100/80 bg-gradient-to-br from-primary-50 via-white to-amber-50/70 dark:border-primary-900/40 dark:from-primary-950/40 dark:via-dark-900 dark:to-dark-950">
      <div class="px-6 py-6 md:px-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
          <!-- 头像 -->
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
            <span>{{ avatarInitial }}</span>
          </div>

          <!-- 用户信息 -->
          <div class="min-w-0 flex-1 space-y-4">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ displayName }}
                </h2>
                <span
                  class="badge"
                  :class="(currentUser as any).is_superuser ? 'badge-danger' : 'badge-gray'"
                >
                  {{ (currentUser as any).is_superuser ? '超级管理员' : '用户' }}
                </span>
              </div>

              <div class="space-y-1">
                <p class="truncate text-sm text-gray-600 dark:text-gray-300">
                  {{ (currentUser as any).email || '未设置邮箱' }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <Tag
                    v-for="role in (currentUser as any).groups"
                    :key="role"
                    type="success"
                  >
                    {{ role }}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 基本信息编辑 -->
    <div class="card">
      <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          编辑个人信息
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-dark-400">
          修改您的账户基本信息
        </p>
      </div>
      <div class="px-6 py-6">
        <form
          class="space-y-4"
          @submit.prevent="handleUpdateProfile"
        >
          <Input
            :model-value="(currentUser as any).username"
            label="用户名"
            disabled
            hint="用户名不可修改"
          />
          <Input
            v-model="profileForm.email"
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <Input
              v-model="profileForm.last_name"
              label="姓"
              placeholder="请输入姓"
            />
            <Input
              v-model="profileForm.first_name"
              label="名"
              placeholder="请输入名"
            />
          </div>

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="updateLoading"
              class="btn btn-primary"
            >
              {{ updateLoading ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改密码 -->
    <div class="card">
      <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          修改密码
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-dark-400">
          更新您的账户密码
        </p>
      </div>
      <div class="px-6 py-6">
        <form
          class="space-y-4"
          @submit.prevent="handleChangePassword"
        >
          <Input
            v-model="passwordForm.old_password"
            label="旧密码"
            type="password"
            placeholder="请输入旧密码"
            autocomplete="current-password"
          />
          <Input
            v-model="passwordForm.new_password"
            label="新密码"
            type="password"
            placeholder="请输入新密码"
            autocomplete="new-password"
            hint="密码长度至少为6位"
          />
          <Input
            v-model="passwordForm.confirm_password"
            label="确认密码"
            type="password"
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="passwordLoading"
              class="btn btn-primary"
            >
              {{ passwordLoading ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { Input, Tag } from '@/components/common'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const updateLoading = ref(false)
const passwordLoading = ref(false)

const profileForm = reactive({ email: '', first_name: '', last_name: '' })
const passwordForm = reactive({ old_password: '', new_password: '', confirm_password: '' })

const currentUser = computed(() => userStore.currentUser || {})
const displayName = computed(() => {
  const user = currentUser.value as any
  const name = [user.last_name, user.first_name].filter(Boolean).join('') || user.username || '用户'
  return name
})
const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U')

onMounted(() => initProfileForm())

const initProfileForm = () => {
  const user = currentUser.value as any
  if (user) {
    profileForm.email = user.email || ''
    profileForm.first_name = user.first_name || ''
    profileForm.last_name = user.last_name || ''
  }
}

const handleUpdateProfile = async () => {
  if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
    useUIStore().showWarning('请输入正确的邮箱地址')
    return
  }
  updateLoading.value = true
  try {
    const result: any = await authAPI.updateProfile(profileForm)
    userStore.setUser({ ...currentUser.value, ...result })
    useUIStore().showSuccess(result.message || '个人信息更新成功')
  } catch (error: any) {
    ErrorHandler.handle(error, 'Profile.handleUpdateProfile')
    useUIStore().showError(error.response?.data?.error || '个人信息更新失败')
  } finally {
    updateLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.old_password) {
    useUIStore().showWarning('请输入旧密码')
    return
  }
  if (!passwordForm.new_password) {
    useUIStore().showWarning('请输入新密码')
    return
  }
  if (passwordForm.new_password.length < 6) {
    useUIStore().showWarning('密码长度至少为6位')
    return
  }
  if (!passwordForm.confirm_password) {
    useUIStore().showWarning('请再次输入新密码')
    return
  }
  if (passwordForm.confirm_password !== passwordForm.new_password) {
    useUIStore().showWarning('两次输入的密码不一致')
    return
  }
  passwordLoading.value = true
  try {
    await authAPI.changePassword(passwordForm)
    useUIStore().showSuccess('密码修改成功，请重新登录')
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    setTimeout(() => {
      userStore.clearUser()
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    ErrorHandler.handle(error, 'Profile.handleChangePassword')
    useUIStore().showError(error.response?.data?.error || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>
