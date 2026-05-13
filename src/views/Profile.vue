<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人信息</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="currentUser.username" disabled />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="姓" prop="last_name">
              <el-input v-model="profileForm.last_name" placeholder="请输入姓" />
            </el-form-item>

            <el-form-item label="名" prop="first_name">
              <el-input v-model="profileForm.first_name" placeholder="请输入名" />
            </el-form-item>

            <el-form-item label="用户角色">
              <el-tag
                v-for="role in currentUser.groups"
                :key="role"
                type="success"
                style="margin-right: 10px;"
              >
                {{ role }}
              </el-tag>
              <el-tag v-if="currentUser.is_superuser" type="danger">
                超级管理员
              </el-tag>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="updateLoading"
                @click="handleUpdateProfile"
              >
                保存修改
              </el-button>
              <el-button @click="resetProfileForm">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="旧密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                placeholder="请输入旧密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="请输入新密码（至少6位）"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-alert
              title="密码安全提示"
              type="info"
              :closable="false"
              style="margin-bottom: 20px;"
            >
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>密码长度至少为6位</li>
                <li>建议使用字母、数字和特殊字符的组合</li>
                <li>不要使用过于简单的密码</li>
              </ul>
            </el-alert>

            <el-form-item>
              <el-button
                type="primary"
                :loading="passwordLoading"
                @click="handleChangePassword"
              >
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('basic')
const updateLoading = ref(false)
const passwordLoading = ref(false)
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const profileForm = reactive({
  email: '',
  first_name: '',
  last_name: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const currentUser = computed(() => userStore.currentUser || {})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const profileRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  old_password: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(() => {
  initProfileForm()
})

const initProfileForm = () => {
  if (currentUser.value) {
    profileForm.email = currentUser.value.email || ''
    profileForm.first_name = currentUser.value.first_name || ''
    profileForm.last_name = currentUser.value.last_name || ''
  }
}

const resetProfileForm = () => {
  initProfileForm()
  ElMessage.info('已重置为原始信息')
}

const handleUpdateProfile = async () => {
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) {
    return false
  }

  updateLoading.value = true
  try {
    const result = await authAPI.updateProfile(profileForm)
    userStore.setUser({ ...currentUser.value, ...result })
    ElMessage.success(result.message || '个人信息更新成功')
  } catch (error) {
    ErrorHandler.handle(error, 'Profile.handleUpdateProfile')
    ElMessage.error(error.response?.data?.error || '个人信息更新失败')
  } finally {
    updateLoading.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.old_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  passwordFormRef.value?.clearValidate()
  ElMessage.info('已清空密码表单')
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) {
    return false
  }

  passwordLoading.value = true
  try {
    await authAPI.changePassword(passwordForm)
    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()
    setTimeout(() => {
      userStore.clearUser()
      router.push('/login')
    }, 2000)
  } catch (error) {
    ErrorHandler.handle(error, 'Profile.handleChangePassword')
    ElMessage.error(error.response?.data?.error || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.profile-form,
.password-form {
  max-width: 600px;
  padding: 20px;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>
