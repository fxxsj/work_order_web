import { requireImageUploadResponseData } from '@/utils/imageUploadResponse'

interface ImageUploadApi {
  uploadImage: (id: number | string, formData: FormData) => Promise<unknown>
}

export const uploadPendingImages = async (
  api: ImageUploadApi,
  resourceId: number | string,
  files: File[]
) => {
  for (let index = 0; index < files.length; index += 1) {
    const formData = new FormData()
    formData.append('image', files[index])
    formData.append('sort_order', String(index))
    const response = await api.uploadImage(resourceId, formData)
    requireImageUploadResponseData(response)
  }
}
