interface ImageUploadResponse {
  success?: unknown
  message?: unknown
  data?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const requireImageUploadResponseData = (response: unknown): Record<string, unknown> => {
  if (!isRecord(response)) {
    throw new Error('图片上传响应格式异常')
  }

  const wrapped = response as ImageUploadResponse
  if ('success' in wrapped && wrapped.success === false) {
    throw new Error(String(wrapped.message || '图片上传失败'))
  }

  const payload = isRecord(wrapped.data) ? wrapped.data : response
  if (!isRecord(payload)) {
    throw new Error('图片上传响应数据异常')
  }

  const id = Number(payload.id)
  const image = String(payload.image || payload.src || payload.url || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !image) {
    throw new Error('图片上传响应数据异常')
  }

  return payload
}
