/**
 * BaseAPI Class
 * 提供标准的 CRUD 操作，消除 90% 的 API 代码重复
 */

import type { AxiosRequestConfig } from 'axios'

export type RequestFunction = <T = unknown>(config: AxiosRequestConfig) => Promise<T>

/**
 * API 响应格式（与 backend response_format.py 对齐）
 * 统一格式: { success, code, message, data, errors?, timestamp? }
 */
export interface BaseAPIResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
  errors?: Record<string, unknown> | null
  timestamp?: string
}

export class BaseAPI {
  [key: string]: any
  baseUrl: string
  request: RequestFunction

  constructor(baseUrl: string, request: RequestFunction) {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('baseUrl must be a non-empty string')
    }
    if (!request || typeof request !== 'function') {
      throw new Error('request must be a function')
    }
    this.baseUrl = baseUrl
    this.request = request
  }

  protected _unwrap(response: unknown): unknown {
    if (
      response &&
      typeof response === 'object' &&
      'success' in response &&
      'data' in response
    ) {
      return (response as BaseAPIResponse).data
    }
    return response
  }

  protected _request(config: AxiosRequestConfig): Promise<unknown> {
    return this.request(config).then(response => this._unwrap(response))
  }

  getList(params?: Record<string, unknown>, config?: { signal?: AbortSignal }): Promise<unknown> {
    const requestConfig: AxiosRequestConfig = {
      url: this.baseUrl,
      method: 'get',
      params
    }
    if (config?.signal) {
      requestConfig.signal = config.signal
    }
    return this.request(requestConfig).then(response => this._unwrap(response))
  }

  getDetail(id: number | string): Promise<unknown> {
    if (!id) {
      return Promise.reject(new Error('ID is required'))
    }
    return this.request({
      url: `${this.baseUrl}${id}/`,
      method: 'get'
    }).then(response => this._unwrap(response))
  }

  create(data: unknown): Promise<unknown> {
    if (!data) {
      return Promise.reject(new Error('Data is required'))
    }
    return this.request({
      url: this.baseUrl,
      method: 'post',
      data
    }).then(response => this._unwrap(response))
  }

  update(id: number | string, data: unknown): Promise<unknown> {
    if (!id) {
      return Promise.reject(new Error('ID is required'))
    }
    if (!data) {
      return Promise.reject(new Error('Data is required'))
    }
    return this.request({
      url: `${this.baseUrl}${id}/`,
      method: 'put',
      data
    }).then(response => this._unwrap(response))
  }

  patch(id: number | string, data: unknown): Promise<unknown> {
    if (!id) {
      return Promise.reject(new Error('ID is required'))
    }
    if (!data) {
      return Promise.reject(new Error('Data is required'))
    }
    return this.request({
      url: `${this.baseUrl}${id}/`,
      method: 'patch',
      data
    }).then(response => this._unwrap(response))
  }

  delete(id: number | string): Promise<unknown> {
    if (!id) {
      return Promise.reject(new Error('ID is required'))
    }
    return this.request({
      url: `${this.baseUrl}${id}/`,
      method: 'delete'
    }).then(response => this._unwrap(response))
  }

  batchAction(data: { action: string; ids?: (number | string)[] } & Record<string, unknown>): Promise<unknown> {
    if (!data) {
      return Promise.reject(new Error('Data is required'))
    }
    return this.request({
      url: `${this.baseUrl}batch_action/`,
      method: 'post',
      data
    }).then(response => this._unwrap(response))
  }

  batchDelete(ids: (number | string)[]): Promise<unknown> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Promise.reject(new Error('IDs array is required'))
    }
    return this.batchAction({
      action: 'delete',
      ids
    } as { action: string; ids: (number | string)[] })
  }

  customAction(
    url: string,
    method: AxiosRequestConfig['method'] = 'get',
    data?: unknown,
    params?: Record<string, unknown>,
    extraConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>
  ): Promise<unknown> {
    const config: AxiosRequestConfig = { url, method, ...extraConfig }
    if (data !== undefined && data !== null) {
      config.data = data
    }
    if (params) {
      config.params = params
    }
    return this.request(config).then(response => this._unwrap(response))
  }
}

export default BaseAPI
