const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const normalizeImageListResponse = (response: unknown): Record<string, unknown>[] => {
  if (Array.isArray(response)) {
    return response.filter(isRecord)
  }

  if (!isRecord(response)) {
    return []
  }

  const data = response.data
  if (Array.isArray(data)) {
    return data.filter(isRecord)
  }

  if (isRecord(data) && Array.isArray(data.results)) {
    return data.results.filter(isRecord)
  }

  if (Array.isArray(response.results)) {
    return response.results.filter(isRecord)
  }

  return []
}
