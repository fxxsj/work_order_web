import { describe, expect, it } from 'vitest'
import { requireImageUploadResponseData } from '@/utils/imageUploadResponse'

describe('requireImageUploadResponseData', () => {
  it('returns wrapped image upload data', () => {
    const data = requireImageUploadResponseData({
      success: true,
      data: {
        id: 1,
        image: '/media/a.jpg'
      }
    })

    expect(data.id).toBe(1)
    expect(data.image).toBe('/media/a.jpg')
  })

  it('returns raw image upload data', () => {
    const data = requireImageUploadResponseData({
      id: '2',
      image: '/media/b.png'
    })

    expect(data.id).toBe('2')
    expect(data.image).toBe('/media/b.png')
  })

  it('throws for business failure responses', () => {
    expect(() => requireImageUploadResponseData({
      success: false,
      message: '格式不支持'
    })).toThrow('格式不支持')
  })

  it('throws for non-object responses', () => {
    expect(() => requireImageUploadResponseData(null)).toThrow('图片上传响应格式异常')
  })

  it('throws when id or image is invalid', () => {
    expect(() => requireImageUploadResponseData({
      id: 0,
      image: '/media/a.jpg'
    })).toThrow('图片上传响应数据异常')

    expect(() => requireImageUploadResponseData({
      id: 1,
      image: ''
    })).toThrow('图片上传响应数据异常')
  })
})
