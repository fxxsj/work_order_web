import { computed, watch, reactive } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface WorkOrderFormState {
  sales_order_id: number | undefined
  customer_id: number | undefined
  status: string
  priority: string
  order_date: string
  delivery_date: string
  production_quantity: number
  defective_quantity: number
  actual_delivery_date: string
  notes: string
  products: any[]
  process_ids: number[]
  materials: any[]
  printing_type: string
  printing_cmyk: string[]
  printing_other_colors: string
  artwork_ids: number[]
  die_ids: number[]
  foiling_plate_ids: number[]
  embossing_plate_ids: number[]
}

export interface UseWorkOrderFormOptions {
  productList: Ref<any[]>
  artworkList: Ref<any[]>
  processList: Ref<any[]>
}

export interface UseWorkOrderFormReturn {
  form: WorkOrderFormState
  calculatedTotalQuantity: ComputedRef<number>
  productDefaultProcessIds: ComputedRef<number[]>
  selectedProductIds: ComputedRef<Set<number>>
  syncMaterialsFromProducts: () => void
  syncColorsFromArtworks: () => void
  syncPrepressFromArtworks: () => void
  syncImpositionFromArtworks: () => void
  recalcProductQuantities: () => void
  cleanupPrepressSelections: (opts: {
    artworkList: Ref<any[]>
    dieList: Ref<any[]>
    foilingPlateList: Ref<any[]>
    embossingPlateList: Ref<any[]>
  }) => void
  resetForm: (isEdit: boolean) => void
  setFormFromDetail: (res: any, productList: Ref<any[]>) => void
  prefillFromSalesOrderDetail: (res: any, productList: Ref<any[]>) => void
  formatPayload: (isEdit: boolean) => any
}

export function useWorkOrderForm(options: UseWorkOrderFormOptions): UseWorkOrderFormReturn {
  const { productList, artworkList } = options

  const normalizeOptionalId = (value: any): number | undefined => {
    const rawValue = value && typeof value === 'object' ? value.id : value
    const parsed = Number(rawValue)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }

  const form = reactive<WorkOrderFormState>({
    sales_order_id: undefined,
    customer_id: undefined,
    status: 'pending',
    priority: 'normal',
    order_date: '',
    delivery_date: '',
    production_quantity: 1,
    defective_quantity: 0,
    actual_delivery_date: '',
    notes: '',
    products: [],
    process_ids: [],
    materials: [],
    printing_type: 'none',
    printing_cmyk: [],
    printing_other_colors: '',
    artwork_ids: [],
    die_ids: [],
    foiling_plate_ids: [],
    embossing_plate_ids: []
  })

  // Calculate total quantity from products
  const calculatedTotalQuantity = computed(() => {
    return form.products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  })

  // Auto-calculate product quantity when production_quantity or imposition changes
  watch(() => form.production_quantity, () => {
    recalcProductQuantities()
  })

  function recalcProductQuantities() {
    for (const p of form.products) {
      if (!p.manual_quantity && p.product) {
        const imposition = p.imposition_quantity || 1
        p.quantity = form.production_quantity * imposition
      }
    }
  }

  // Collect default process IDs from all selected products
  const productDefaultProcessIds = computed(() => {
    const ids = new Set<number>()
    for (const p of form.products) {
      const productId = typeof p.product === 'object' ? p.product?.id : p.product
      if (!productId) continue
      const productData = productList.value.find((pr: any) => pr.id === productId)
      if (productData?.default_processes) {
        for (const id of productData.default_processes) {
          ids.add(typeof id === 'object' ? id.id : id)
        }
      }
    }
    return [...ids]
  })

  // Track previous default process IDs to detect changes
  let prevDefaultProcessIds: number[] = []

  // Auto-merge default processes when products change
  watch(productDefaultProcessIds, (newIds) => {
    const added = newIds.filter(id => !prevDefaultProcessIds.includes(id))

    for (const id of added) {
      if (!form.process_ids.includes(id)) {
        form.process_ids.push(id)
      }
    }

    prevDefaultProcessIds = [...newIds]
  }, { immediate: true })

  // Computed: selected product ids
  const selectedProductIds = computed(() => {
    const ids = new Set<number>()
    for (const p of form.products) {
      const productId = typeof p.product === 'object' ? p.product?.id : p.product
      if (productId) ids.add(productId)
    }
    return ids
  })

  // Sync materials from product default_materials
  function syncMaterialsFromProducts() {
    const existingMaterialIds = new Set(
      form.materials.filter((m: any) => m.material).map((m: any) => m.material)
    )

    for (const p of form.products) {
      const productId = typeof p.product === 'object' ? p.product?.id : p.product
      if (!productId) continue
      const productData = productList.value.find((pr: any) => pr.id === productId)
      if (!productData?.default_materials) continue

      for (const dm of productData.default_materials) {
        const materialId = dm.material?.id || dm.material
        if (!existingMaterialIds.has(materialId)) {
          form.materials.push({
            material: materialId,
            material_size: dm.material_size || '',
            material_usage: dm.material_usage || '',
            calculation_mode: dm.calculation_mode || (dm.planning_required ? 'sheet_imposition' : 'fixed'),
            preparation_mode: dm.preparation_mode || (dm.need_cutting ? 'internal_cutting' : (dm.planning_required ? 'supplier_cutting' : 'direct')),
            notes: dm.notes || '',
            auto_filled: true,
          })
          existingMaterialIds.add(materialId)
        }
      }
    }
  }

  // Auto-fill CMYK, other colors, and imposition_quantity from selected artworks
  watch(() => form.artwork_ids, () => {
    syncColorsFromArtworks()
    syncPrepressFromArtworks()
    syncImpositionFromArtworks()
  }, { deep: true })

  function syncColorsFromArtworks() {
    const cmykSet = new Set<string>()
    const otherSet = new Set<string>()

    for (const artworkId of form.artwork_ids) {
      const artwork = artworkList.value.find((a: any) => a.id === artworkId)
      if (!artwork) continue
      if (artwork.cmyk_colors) {
        for (const c of artwork.cmyk_colors) cmykSet.add(c)
      }
      if (artwork.other_colors) {
        for (const c of artwork.other_colors) otherSet.add(c)
      }
    }

    // Only auto-fill if user hasn't manually changed colors, or if currently empty
    if (form.printing_cmyk.length === 0 || form.printing_cmyk.every(c => cmykSet.has(c))) {
      form.printing_cmyk = [...cmykSet]
    }
    if (!form.printing_other_colors || form.printing_other_colors.split(',').every(s => otherSet.has(s.trim()))) {
      form.printing_other_colors = [...otherSet].join(', ')
    }
  }

  // Sync die_ids / foiling_plate_ids / embossing_plate_ids from selected artworks' M2M fields
  function syncPrepressFromArtworks() {
    const dieIdSet = new Set<number>(form.die_ids)
    const foilingIdSet = new Set<number>(form.foiling_plate_ids)
    const embossingIdSet = new Set<number>(form.embossing_plate_ids)

    for (const artworkId of form.artwork_ids) {
      const artwork = artworkList.value.find((a: any) => a.id === artworkId)
      if (!artwork) continue
      if (Array.isArray(artwork.dies)) {
        for (const dieId of artwork.dies) {
          dieIdSet.add(dieId)
        }
      }
      if (Array.isArray(artwork.foiling_plates)) {
        for (const fpId of artwork.foiling_plates) {
          foilingIdSet.add(fpId)
        }
      }
      if (Array.isArray(artwork.embossing_plates)) {
        for (const epId of artwork.embossing_plates) {
          embossingIdSet.add(epId)
        }
      }
    }

    form.die_ids = [...dieIdSet]
    form.foiling_plate_ids = [...foilingIdSet]
    form.embossing_plate_ids = [...embossingIdSet]
  }

  // Update imposition_quantity from artwork-product relationships, then recalc product quantities
  function syncImpositionFromArtworks() {
    if (form.artwork_ids.length === 0) return

    for (const productItem of form.products) {
      if (!productItem.product) continue
      const productId = typeof productItem.product === 'object' ? productItem.product?.id : productItem.product
      if (!productId) continue

      // Find the first artwork that has this product and get its imposition_quantity
      for (const artworkId of form.artwork_ids) {
        const artwork = artworkList.value.find((a: any) => a.id === artworkId)
        if (!artwork || !artwork.products) continue
        const ap = artwork.products.find((p: any) => p.product === productId)
        if (ap && ap.imposition_quantity) {
          productItem.imposition_quantity = ap.imposition_quantity
          // Recalculate quantity if user hasn't manually overridden
          if (!productItem.manual_quantity) {
            productItem.quantity = form.production_quantity * ap.imposition_quantity
          }
          break
        }
      }
    }
  }

  function cleanupPrepressSelections(opts: {
    artworkList: Ref<any[]>
    dieList: Ref<any[]>
    foilingPlateList: Ref<any[]>
    embossingPlateList: Ref<any[]>
  }) {
    const productIds = selectedProductIds.value
    if (productIds.size === 0) return

    // Clear artworks that don't contain any selected product
    if (form.artwork_ids.length > 0) {
      form.artwork_ids = form.artwork_ids.filter((id: number) => {
        const artwork = opts.artworkList.value.find((a: any) => a.id === id)
        if (!artwork) return false
        if (!artwork.products || artwork.products.length === 0) return true
        return artwork.products.some((ap: any) => productIds.has(ap.product))
      })
    }

    // Clear dies that don't contain any selected product
    if (form.die_ids.length > 0) {
      form.die_ids = form.die_ids.filter((id: number) => {
        const die = opts.dieList.value.find((d: any) => d.id === id)
        if (!die || !die.products || die.products.length === 0) return true
        return die.products.some((dp: any) => productIds.has(dp.product))
      })
    }

    // Clear foiling plates
    if (form.foiling_plate_ids.length > 0) {
      form.foiling_plate_ids = form.foiling_plate_ids.filter((id: number) => {
        const plate = opts.foilingPlateList.value.find((f: any) => f.id === id)
        if (!plate || !plate.products || plate.products.length === 0) return true
        return plate.products.some((fp: any) => productIds.has(fp.product))
      })
    }

    // Clear embossing plates
    if (form.embossing_plate_ids.length > 0) {
      form.embossing_plate_ids = form.embossing_plate_ids.filter((id: number) => {
        const plate = opts.embossingPlateList.value.find((e: any) => e.id === id)
        if (!plate || !plate.products || plate.products.length === 0) return true
        return plate.products.some((ep: any) => productIds.has(ep.product))
      })
    }
  }

  function resetForm(isEdit: boolean) {
    form.sales_order_id = undefined
    form.customer_id = undefined
    form.status = 'pending'
    form.priority = 'normal'
    form.order_date = ''
    form.delivery_date = ''
    form.production_quantity = 1
    form.defective_quantity = 0
    form.actual_delivery_date = ''
    form.notes = ''
    form.products = []
    form.process_ids = []
    form.materials = []
    form.printing_type = 'none'
    form.printing_cmyk = []
    form.printing_other_colors = ''
    form.artwork_ids = []
    form.die_ids = []
    form.foiling_plate_ids = []
    form.embossing_plate_ids = []
    prevDefaultProcessIds = []

    if (!isEdit) {
      const today = new Date()
      form.order_date = today.toISOString().split('T')[0]
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      form.delivery_date = nextWeek.toISOString().split('T')[0]
    }
  }

  function setFormFromDetail(res: any, productListRef: Ref<any[]>) {
    Object.assign(form, {
      sales_order_id: normalizeOptionalId(
        res.sales_order_id ?? res.sales_order
      ),
      customer_id: res.customer?.id || res.customer,
      status: res.status || 'pending',
      priority: res.priority || 'normal',
      order_date: res.order_date ? res.order_date.split('T')[0] : '',
      delivery_date: res.delivery_date ? res.delivery_date.split('T')[0] : '',
      production_quantity: res.production_quantity || 1,
      defective_quantity: res.defective_quantity || 0,
      actual_delivery_date: res.actual_delivery_date ? res.actual_delivery_date.split('T')[0] : '',
      notes: res.notes || '',
      // 工序回显：优先用后端派生的 process_ids，回退到 order_processes 提取
      process_ids: res.process_ids
        || (res.order_processes || []).map((p: any) => p.process?.id || p.process).filter(Boolean),
      printing_type: res.printing_type || 'none',
      printing_cmyk: res.printing_cmyk_colors || res.printing_cmyk || [],
      printing_other_colors: (res.printing_other_colors || []).join(', '),
      // 资产 ID 列表：后端字段名为 artworks/dies/...（PrimaryKeyRelatedField）
      artwork_ids: res.artworks || res.artwork_ids || [],
      die_ids: res.dies || res.die_ids || [],
      foiling_plate_ids: res.foiling_plates || res.foiling_plate_ids || [],
      embossing_plate_ids: res.embossing_plates || res.embossing_plate_ids || []
    })

    // Load products
    if (res.products && Array.isArray(res.products)) {
      form.products = res.products.map((p: any) => {
        const productId = p.product?.id || p.product
        const productData = productListRef.value.find((pr: any) => pr.id === productId)
        return {
          product: productId,
          imposition_quantity: p.imposition_quantity || 1,
          quantity: p.quantity || 1,
          unit: productData?.unit || p.unit || '件',
          specification: p.specification || '',
          source_type: p.source_type || 'stock',
          sales_order_item: p.sales_order_item || undefined,
          sort_order: p.sort_order || 0,
          manual_quantity: true, // Edit mode: preserve existing quantities
        }
      })
    }

    // Load materials
    if (res.materials && Array.isArray(res.materials)) {
      form.materials = res.materials.map((m: any) => ({
        material: m.material?.id || m.material,
        quantity: m.quantity || 1,
        material_size: m.material_size || '',
        material_usage: m.material_usage || '',
        calculation_mode: m.calculation_mode || (m.planning_required ? 'sheet_imposition' : 'fixed'),
        preparation_mode: m.preparation_mode || (m.need_cutting ? 'internal_cutting' : (m.planning_required ? 'supplier_cutting' : 'direct')),
        notes: m.notes || ''
      }))
    }
  }

  function prefillFromSalesOrderDetail(res: any, productListRef: Ref<any[]>) {
    form.sales_order_id = res.id
    if (res.customer) form.customer_id = typeof res.customer === 'object' ? res.customer.id : res.customer
    if (res.order_date) form.order_date = res.order_date.split('T')[0]
    if (res.delivery_date) form.delivery_date = res.delivery_date.split('T')[0]
    if (res.notes) form.notes = res.notes

    // Pre-fill products from sales order items
    if (res.items && res.items.length > 0) {
      form.products = res.items.map((item: any) => {
        const productData = productListRef.value.find((p: any) => p.id === item.product)
        return {
          product: item.product,
          imposition_quantity: 1,
          quantity: item.quantity || form.production_quantity,
          unit: productData?.unit || item.unit || '件',
          specification: item.specification || '',
          sales_order_item: item.id,
          manual_quantity: false,
        }
      })
      syncMaterialsFromProducts()
    }
  }

  function formatPayload(_isEdit: boolean) {
    const payload: any = {
      customer: form.customer_id,
      status: form.status,
      priority: form.priority,
      order_date: form.order_date || undefined,
      delivery_date: form.delivery_date || undefined,
      production_quantity: form.production_quantity,
      defective_quantity: form.defective_quantity || 0,
      actual_delivery_date: form.actual_delivery_date || undefined,
      notes: form.notes?.trim() || undefined,
      processes: form.process_ids,
      printing_type: form.printing_type || 'none',
      printing_cmyk_colors: form.printing_cmyk,
      printing_other_colors: form.printing_other_colors
        ? form.printing_other_colors.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      artworks: form.artwork_ids,
      dies: form.die_ids,
      foiling_plates: form.foiling_plate_ids,
      embossing_plates: form.embossing_plate_ids
    }

    if (form.sales_order_id) {
      payload.sales_order = form.sales_order_id
    }

    // Format products
    payload.products_data = form.products
      .filter(p => p.product)
      .map(p => ({
        product: typeof p.product === 'object' ? p.product.id : p.product,
        quantity: Number(p.quantity || 0),
        unit: p.unit || '件',
        specification: p.specification || '',
        source_type: p.source_type || 'stock',
        sales_order_item: p.sales_order_item || undefined,
        sort_order: p.sort_order || 0,
      }))

    // Format materials
    payload.materials_data = form.materials
      .filter(m => m.material)
      .map(m => ({
        material: typeof m.material === 'object' ? m.material.id : m.material,
        material_size: m.material_size || '',
        material_usage: m.material_usage || '',
        calculation_mode: m.calculation_mode || 'fixed',
        preparation_mode: m.preparation_mode || 'direct',
        notes: m.notes?.trim() || undefined
      }))

    return payload
  }

  return {
    form,
    calculatedTotalQuantity,
    productDefaultProcessIds,
    selectedProductIds,
    syncMaterialsFromProducts,
    syncColorsFromArtworks,
    syncPrepressFromArtworks,
    syncImpositionFromArtworks,
    recalcProductQuantities,
    cleanupPrepressSelections,
    resetForm,
    setFormFromDetail,
    prefillFromSalesOrderDetail,
    formatPayload
  }
}
