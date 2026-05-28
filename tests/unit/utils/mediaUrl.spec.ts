import { describe, expect, it } from 'vitest'
import { imageNameFromUrl, resolveMediaUrl } from '@/utils/mediaUrl'

describe('mediaUrl', () => {
  it('keeps absolute urls unchanged', () => {
    expect(resolveMediaUrl('https://example.com/media/a.jpg')).toBe('https://example.com/media/a.jpg')
  })

  it('resolves absolute paths against current origin', () => {
    expect(resolveMediaUrl('/media/a.jpg')).toBe('http://localhost/media/a.jpg')
  })

  it('normalizes relative media paths', () => {
    expect(resolveMediaUrl('media/a.jpg')).toBe('http://localhost/media/a.jpg')
  })

  it('returns an empty string for empty values', () => {
    expect(resolveMediaUrl('')).toBe('')
    expect(resolveMediaUrl(null)).toBe('')
  })

  it('extracts image names from urls', () => {
    expect(imageNameFromUrl('/media/products/demo.jpg?x=1')).toBe('demo.jpg')
    expect(imageNameFromUrl('')).toBe('图片')
  })
})
