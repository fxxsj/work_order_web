/**
 * Normalize API responses to business payloads.
 * Supports standard backend wrapper: { success, data, message, code, timestamp }.
 *
 * 注意：axios 响应拦截器已经返回 response.data，所以这里的 response 已经是后端返回的 JSON。
 * 如果后端使用 StandardJSONRenderer，响应格式为 { success, data, message, code, timestamp }。
 * 此时 unwrapApiResponse 会提取 data 字段。
 * 如果响应已经被 unwrap 过（例如 BaseAPI._unwrap），则直接返回。
 */
export function unwrapApiResponse(response: any) {
  if (!response) return null
  // 如果 response 已经是 unwrap 过的数据（没有 success 字段），直接返回
  if (typeof response === 'object' && !('success' in response)) {
    return response
  }
  // 标准包装格式 { success, data, message, code, timestamp }
  if (typeof response === 'object' && 'success' in response && 'data' in response) {
    return response.data
  }
  return response
}

export default unwrapApiResponse
