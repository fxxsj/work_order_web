import { describe, expect, it } from 'vitest'
import { normalizeImageListResponse } from '@/utils/imageListResponse'

describe('normalizeImageListResponse', () => {
  it('returns raw list responses', () => {
    expect(normalizeImageListResponse([{ id: 1, image: '/media/a.jpg' }])).toEqual([
      { id: 1, image: '/media/a.jpg' }
    ])
  })

  it('returns standard data list responses', () => {
    expect(normalizeImageListResponse({
      success: true,
      data: [{ id: 2, image: '/media/b.jpg' }]
    })).toEqual([{ id: 2, image: '/media/b.jpg' }])
  })

  it('returns paginated data results responses', () => {
    expect(normalizeImageListResponse({
      success: true,
      data: {
        count: 1,
        results: [{ id: 3, image: '/media/c.jpg' }]
      }
    })).toEqual([{ id: 3, image: '/media/c.jpg' }])
  })

  it('returns top-level paginated responses', () => {
    expect(normalizeImageListResponse({
      count: 1,
      results: [{ id: 4, image: '/media/d.jpg' }]
    })).toEqual([{ id: 4, image: '/media/d.jpg' }])
  })

  it('drops non-object list entries and returns empty list for invalid responses', () => {
    expect(normalizeImageListResponse([{ id: 5 }, null, 'bad'])).toEqual([{ id: 5 }])
    expect(normalizeImageListResponse(null)).toEqual([])
    expect(normalizeImageListResponse({ data: null })).toEqual([])
  })
})
