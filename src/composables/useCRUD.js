import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useCRUD(api, options = {}) {
  const {
    onSuccess,
    onError,
    transformRequest,
    transformResponse,
  } = options

  const loading = ref(false)
  const data = ref(null)

  const request = async (fn, successMsg, errorMsg) => {
    loading.value = true
    try {
      const response = await fn()
      const result = transformResponse ? transformResponse(response) : response

      if (result?.success !== false) {
        if (successMsg) {
          ElMessage.success(successMsg)
        }
        if (onSuccess) {
          onSuccess(result)
        }
        return result
      } else {
        if (errorMsg || result?.message) {
          ElMessage.error(result?.message || errorMsg)
        }
        if (onError) {
          onError(result)
        }
        return null
      }
    } catch (error) {
      console.error('CRUD request failed:', error)
      ElMessage.error(error?.message || errorMsg || '操作失败')
      if (onError) {
        onError(error)
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const create = async (params, successMsg = '创建成功') => {
    const transformed = transformRequest ? transformRequest(params) : params
    return request(() => api.create(transformed), successMsg)
  }

  const update = async (id, params, successMsg = '更新成功') => {
    const transformed = transformRequest ? transformRequest(params) : params
    return request(() => api.update(id, transformed), successMsg)
  }

  const remove = async (id, successMsg = '删除成功') => {
    return request(() => api.delete(id), successMsg)
  }

  const getById = async (id) => {
    loading.value = true
    try {
      const response = await api.getDetail(id)
      data.value = transformResponse ? transformResponse(response) : response
      return data.value
    } catch (error) {
      console.error('Get by id failed:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const list = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.getList(params)
      const result = transformResponse ? transformResponse(response) : response
      data.value = result
      return result
    } catch (error) {
      console.error('List failed:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    data,
    create,
    update,
    remove,
    getById,
    list,
  }
}
