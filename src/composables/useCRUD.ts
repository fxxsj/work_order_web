import { ref } from 'vue'
import { ElMessage } from '@/utils/message'

interface CrudAPI {
  create: (data: unknown) => Promise<unknown>
  update: (id: number | string, data: unknown) => Promise<unknown>
  delete: (id: number | string) => Promise<unknown>
  getDetail: (id: number | string) => Promise<unknown>
  getList: (params?: Record<string, unknown>) => Promise<unknown>
}

interface UseCRUDOptions {
  onSuccess?: (result: unknown) => void
  onError?: (error: unknown) => void
  transformRequest?: (data: unknown) => unknown
  transformResponse?: (response: unknown) => unknown
}

export function useCRUD(api: CrudAPI, options: UseCRUDOptions = {}) {
  const { onSuccess, onError, transformRequest, transformResponse } = options

  const loading = ref(false)
  const data = ref<unknown>(null)

  const request = async (fn: () => Promise<unknown>, successMsg?: string, errorMsg?: string) => {
    loading.value = true
    try {
      const response = await fn()
      const result = transformResponse ? transformResponse(response) : response

      if ((result as Record<string, unknown>)?.success !== false) {
        if (successMsg) {
          ElMessage.success(successMsg)
        }
        if (onSuccess) {
          onSuccess(result)
        }
        return result
      } else {
        const msg = (result as Record<string, unknown>)?.message as string | undefined
        if (errorMsg || msg) {
          ElMessage.error(msg || errorMsg || '操作失败')
        }
        if (onError) {
          onError(result)
        }
        return null
      }
    } catch (error: any) {
      console.error('CRUD request failed:', error)
      ElMessage.error((error as Error)?.message || errorMsg || '操作失败')
      if (onError) {
        onError(error)
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const create = async (params: unknown, successMsg = '创建成功') => {
    const transformed = transformRequest ? transformRequest(params) : params
    return request(() => api.create(transformed), successMsg)
  }

  const update = async (id: number | string, params: unknown, successMsg = '更新成功') => {
    const transformed = transformRequest ? transformRequest(params) : params
    return request(() => api.update(id, transformed), successMsg)
  }

  const remove = async (id: number | string, successMsg = '删除成功') => {
    return request(() => api.delete(id), successMsg)
  }

  const getById = async (id: number | string) => {
    loading.value = true
    try {
      const response = await api.getDetail(id)
      data.value = transformResponse ? transformResponse(response) : response
      return data.value
    } catch (error: any) {
      console.error('Get by id failed:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const list = async (params: Record<string, unknown> = {}) => {
    loading.value = true
    try {
      const response = await api.getList(params)
      const result = transformResponse ? transformResponse(response) : response
      data.value = result
      return result
    } catch (error: any) {
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
