import { ref } from 'vue'
import { materialAPI, processAPI, productAPI, productGroupAPI, productMaterialAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import { uploadPendingImages } from '@/utils/pendingImageUpload'

interface ProductFormPayload {
  form: Record<string, any>
  materialItems?: any[]
  pendingImages?: File[]
}

interface ProductSaveOptions {
  successMessage?: string
  imageFailureMessage?: string
}

const toList = (response: any) => Array.isArray(response) ? response : (response?.results || response?.data || [])

export const useProductFormSupportData = () => {
  const supportLoaded = ref(false)
  const materialList = ref<any[]>([])
  const processList = ref<any[]>([])
  const productGroupList = ref<any[]>([])

  const loadAllProcesses = async () => {
    let allProcesses: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response: any = await processAPI.getList({ is_active: true, page_size: 100, page })
      const list = toList(response)
      allProcesses = allProcesses.concat(list)
      hasMore = Boolean(response?.next) && list.length > 0
      page += 1
    }

    processList.value = allProcesses
  }

  const loadSupportData = async () => {
    if (supportLoaded.value) return

    try {
      const [materialsResponse, productGroupsResponse] = await Promise.all([
        materialAPI.getList({ page_size: 100 }),
        productGroupAPI.getList({ page_size: 100, is_active: true })
      ])

      materialList.value = toList(materialsResponse)
      productGroupList.value = toList(productGroupsResponse)
      await loadAllProcesses()
      supportLoaded.value = true
    } catch (error: any) {
      ErrorHandler.showMessage(error, '加载产品表单数据失败')
    }
  }

  return {
    materialList,
    processList,
    productGroupList,
    loadSupportData
  }
}

export const useProductFormWorkflow = () => {
  const saving = ref(false)

  const saveProductMaterials = async (productId: any, materialItems: any[]) => {
    for (let i = 0; i < materialItems.length; i++) {
      const item = materialItems[i]
      if (!item.material) continue

      try {
        await productMaterialAPI.create({
          product: productId,
          material: item.material,
          material_size: item.material_size || '',
          material_usage: item.material_usage || '',
          need_cutting: item.need_cutting || false,
          planning_required: item.planning_required || false,
          notes: item.notes || '',
          sort_order: i
        })
      } catch (error: any) {
        logger.warn('保存产品物料失败', error)
      }
    }
  }

  const replaceProductMaterials = async (productId: any, materialItems: any[]) => {
    try {
      const existingMaterials: any = await productMaterialAPI.getList({ product: productId })
      const list = toList(existingMaterials)
      for (const material of list) {
        await productMaterialAPI.delete(material.id)
      }
    } catch (error: any) {
      logger.warn('删除现有产品物料失败', error)
    }

    await saveProductMaterials(productId, materialItems)
  }

  const createProduct = async (payload: ProductFormPayload, options: ProductSaveOptions = {}) => {
    const { form, materialItems = [], pendingImages = [] } = payload
    saving.value = true

    try {
      const created: any = await productAPI.create(form)
      await saveProductMaterials(created.id, materialItems)

      if (pendingImages.length > 0) {
        try {
          await uploadPendingImages(productAPI, created.id, pendingImages)
        } catch (error: any) {
          ErrorHandler.showMessage(error, options.imageFailureMessage || '产品已创建，部分图片上传失败，请进入编辑页重试')
        }
      }

      useUIStore().showSuccess(options.successMessage || '创建成功')
      return created
    } finally {
      saving.value = false
    }
  }

  const updateProduct = async (productId: any, payload: ProductFormPayload, options: ProductSaveOptions = {}) => {
    const { form, materialItems = [] } = payload
    saving.value = true

    try {
      const updated: any = await productAPI.update(productId, form)
      await replaceProductMaterials(productId, materialItems)
      useUIStore().showSuccess(options.successMessage || '保存成功')
      return updated
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    createProduct,
    updateProduct
  }
}
