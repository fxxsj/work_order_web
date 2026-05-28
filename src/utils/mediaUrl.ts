export function resolveMediaUrl(raw?: string | null): string {
  const value = String(raw || '').trim()
  if (!value) return ''

  try {
    const parsed = new URL(value)
    if (parsed.protocol) return parsed.toString()
  } catch (_) {
    // Relative paths are resolved below.
  }

  if (value.startsWith('//')) {
    return `${window.location.protocol || 'http:'}${value}`
  }

  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${window.location.origin || 'http://localhost'}${normalized}`
}

export function imageNameFromUrl(raw?: string | null): string {
  const value = String(raw || '').trim()
  if (!value) return '图片'
  const path = value.split('?')[0].split('#')[0]
  const name = path.split('/').filter(Boolean).pop()
  return name || '图片'
}
