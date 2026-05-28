import { describe, expect, it, vi } from 'vitest'
import { uploadPendingImages } from '@/utils/pendingImageUpload'

const makeFile = (name: string) => new File(['x'], name, { type: 'image/jpeg' })

describe('uploadPendingImages', () => {
  it('uploads files sequentially with sort order', async () => {
    const api = {
      uploadImage: vi.fn()
        .mockResolvedValueOnce({ id: 1, image: '/media/a.jpg' })
        .mockResolvedValueOnce({ id: 2, image: '/media/b.jpg' })
    }

    await uploadPendingImages(api, 10, [makeFile('a.jpg'), makeFile('b.jpg')])

    expect(api.uploadImage).toHaveBeenCalledTimes(2)
    expect(api.uploadImage.mock.calls[0][0]).toBe(10)
    expect(api.uploadImage.mock.calls[0][1].get('sort_order')).toBe('0')
    expect(api.uploadImage.mock.calls[1][1].get('sort_order')).toBe('1')
  })

  it('throws when upload response is invalid', async () => {
    const api = {
      uploadImage: vi.fn().mockResolvedValue({ success: true, data: {} })
    }

    await expect(uploadPendingImages(api, 10, [makeFile('a.jpg')]))
      .rejects
      .toThrow('图片上传响应数据异常')
  })
})
