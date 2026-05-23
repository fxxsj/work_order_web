/**
 * BaseAPI 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BaseAPI } from '@/api/base/BaseAPI'

// Mock axios request function
const createMockRequest = () => {
  return vi.fn().mockImplementation((config) => {
    return Promise.resolve({
      success: true,
      data: config?.data || { results: [{ id: 1, name: 'test' }] },
      total: 1
    })
  })
}

describe('BaseAPI', () => {
  let mockRequest: ReturnType<typeof createMockRequest>

  beforeEach(() => {
    mockRequest = createMockRequest()
  })

  describe('constructor', () => {
    it('应该正确初始化 baseUrl 和 request', () => {
      const api = new BaseAPI('/users/', mockRequest)
      expect(api.baseUrl).toBe('/users/')
      expect(api.request).toBe(mockRequest)
    })

    it('baseUrl 为空应该抛出错误', () => {
      expect(() => new BaseAPI('', mockRequest)).toThrow('baseUrl must be a non-empty string')
    })

    it('request 不是函数应该抛出错误', () => {
      expect(() => new BaseAPI('/users/', 'not a function' as any)).toThrow('request must be a function')
    })
  })

  describe('_unwrap', () => {
    it('应该解包标准的响应格式', () => {
      const api = new BaseAPI('/users/', mockRequest)
      const response = {
        success: true,
        data: { id: 1, name: 'test' }
      }
      const result = api._unwrap(response)
      expect(result).toEqual({ id: 1, name: 'test' })
    })

    it('应该处理非标准响应格式', () => {
      const api = new BaseAPI('/users/', mockRequest)
      const response = { id: 1, name: 'test' }
      const result = api._unwrap(response)
      expect(result).toEqual({ id: 1, name: 'test' })
    })

    it('应该处理 null 和 undefined', () => {
      const api = new BaseAPI('/users/', mockRequest)
      expect(api._unwrap(null)).toBeNull()
      expect(api._unwrap(undefined)).toBeUndefined()
    })
  })

  describe('getList', () => {
    it('应该发送 GET 请求到 baseUrl', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.getList({ page: 1, page_size: 20 })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/',
          method: 'get',
          params: { page: 1, page_size: 20 }
        })
      )
    })

    it('应该支持 signal 参数用于请求取消', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      const abortController = new AbortController()

      await api.getList({ page: 1 }, { signal: abortController.signal })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          signal: abortController.signal
        })
      )
    })

    it('应该解包响应数据', async () => {
      const mockRequestWithUnwrap = vi.fn().mockResolvedValue({
        success: true,
        data: { results: [{ id: 1 }], total: 1 }
      })
      const api = new BaseAPI('/users/', mockRequestWithUnwrap)
      const result = await api.getList()

      expect(result).toEqual({ results: [{ id: 1 }], total: 1 })
    })
  })

  describe('getDetail', () => {
    it('应该发送 GET 请求到指定 ID 的 URL', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.getDetail(123)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/123/',
          method: 'get'
        })
      )
    })

    it('ID 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.getDetail('' as any)).rejects.toThrow('ID is required')
      await expect(api.getDetail(null as any)).rejects.toThrow('ID is required')
    })
  })

  describe('create', () => {
    it('应该发送 POST 请求到 baseUrl', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      const data = { name: 'test', email: 'test@example.com' }
      await api.create(data)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/',
          method: 'post',
          data
        })
      )
    })

    it('data 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.create(null)).rejects.toThrow('Data is required')
    })
  })

  describe('update', () => {
    it('应该发送 PUT 请求到指定 ID 的 URL', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      const data = { name: 'updated' }
      await api.update(123, data)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/123/',
          method: 'put',
          data
        })
      )
    })

    it('ID 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.update('' as any, {})).rejects.toThrow('ID is required')
    })

    it('data 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.update(123, null)).rejects.toThrow('Data is required')
    })
  })

  describe('patch', () => {
    it('应该发送 PATCH 请求到指定 ID 的 URL', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      const data = { name: 'patched' }
      await api.patch(123, data)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/123/',
          method: 'patch',
          data
        })
      )
    })
  })

  describe('delete', () => {
    it('应该发送 DELETE 请求到指定 ID 的 URL', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.delete(123)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/123/',
          method: 'delete'
        })
      )
    })

    it('ID 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.delete('' as any)).rejects.toThrow('ID is required')
    })
  })

  describe('batchAction', () => {
    it('应该发送 POST 请求到 batch_action URL', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      const data = { action: 'activate', ids: [1, 2, 3] }
      await api.batchAction(data)

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/batch_action/',
          method: 'post',
          data
        })
      )
    })

    it('data 为空应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.batchAction(null)).rejects.toThrow('Data is required')
    })
  })

  describe('batchDelete', () => {
    it('应该发送正确的批量删除请求', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.batchDelete([1, 2, 3])

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/users/batch_action/',
          method: 'post',
          data: { action: 'delete', ids: [1, 2, 3] }
        })
      )
    })

    it('空数组应该抛出错误', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await expect(api.batchDelete([])).rejects.toThrow('IDs array is required')
      await expect(api.batchDelete(null as any)).rejects.toThrow('IDs array is required')
    })
  })

  describe('customAction', () => {
    it('应该发送自定义请求', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.customAction('/search/', 'post', { query: 'test' }, { page: 1 })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/search/',
          method: 'post',
          data: { query: 'test' },
          params: { page: 1 }
        })
      )
    })

    it('应该支持额外配置', async () => {
      const api = new BaseAPI('/users/', mockRequest)
      await api.customAction('/custom/', 'get', undefined, undefined, {
        headers: { 'X-Custom': 'header' }
      })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/custom/',
          method: 'get',
          headers: { 'X-Custom': 'header' }
        })
      )
    })
  })
})
