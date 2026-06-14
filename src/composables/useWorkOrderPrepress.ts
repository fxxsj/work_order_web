import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface PrepressResourceLists {
  artworkList: Ref<any[]>
  dieList: Ref<any[]>
  foilingPlateList: Ref<any[]>
  embossingPlateList: Ref<any[]>
}

export interface PrepressLoadingState {
  artworkLoading: Ref<boolean>
  dieLoading: Ref<boolean>
  foilingPlateLoading: Ref<boolean>
  embossingPlateLoading: Ref<boolean>
}

export interface UseWorkOrderPrepressReturn {
  artworkOptions: ComputedRef<any[]>
  dieOptions: ComputedRef<any[]>
  foilingPlateOptions: ComputedRef<any[]>
  embossingPlateOptions: ComputedRef<any[]>
  requiredResources: ComputedRef<{ artwork: boolean; die: boolean; foilingPlate: boolean; embossingPlate: boolean }>
}

export function useWorkOrderPrepress(
  selectedProductIds: ComputedRef<Set<number>>,
  lists: PrepressResourceLists
): UseWorkOrderPrepressReturn {
  const { artworkList, dieList, foilingPlateList, embossingPlateList } = lists

  const artworkOptions = computed(() => {
    const productIds = selectedProductIds.value
    const filtered = productIds.size > 0
      ? artworkList.value.filter((a: any) => {
          if (!a.products || a.products.length === 0) return true
          return a.products.some((ap: any) => productIds.has(ap.product))
        })
      : artworkList.value
    return filtered.map((a: any) => {
      const productNames = (a.products || [])
        .filter((ap: any) => productIds.size === 0 || productIds.has(ap.product))
        .map((ap: any) => ap.product_name || '')
        .filter(Boolean)
      const suffix = productNames.length > 0 ? ` (${productNames.join(', ')})` : ''
      return {
        value: a.id,
        label: a.code ? `${a.code} - ${a.name}${suffix}` : `${a.name}${suffix}`,
      }
    })
  })

  const dieOptions = computed(() => {
    const productIds = selectedProductIds.value
    const filtered = productIds.size > 0
      ? dieList.value.filter((d: any) => {
          if (!d.products || d.products.length === 0) return true
          return d.products.some((dp: any) => productIds.has(dp.product))
        })
      : dieList.value
    return filtered.map((d: any) => {
      const base = d.code ? `${d.name} (${d.code})` : d.name
      const names = (d.products || []).map((dp: any) => dp.product_name).filter(Boolean)
      const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
      return { value: d.id, label: `${base}${suffix}` }
    })
  })

  const foilingPlateOptions = computed(() => {
    const productIds = selectedProductIds.value
    const filtered = productIds.size > 0
      ? foilingPlateList.value.filter((f: any) => {
          if (!f.products || f.products.length === 0) return true
          return f.products.some((fp: any) => productIds.has(fp.product))
        })
      : foilingPlateList.value
    return filtered.map((f: any) => {
      const base = f.code ? `${f.name} (${f.code})` : f.name
      const names = (f.products || []).map((fp: any) => fp.product_name).filter(Boolean)
      const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
      return { value: f.id, label: `${base}${suffix}` }
    })
  })

  const embossingPlateOptions = computed(() => {
    const productIds = selectedProductIds.value
    const filtered = productIds.size > 0
      ? embossingPlateList.value.filter((e: any) => {
          if (!e.products || e.products.length === 0) return true
          return e.products.some((ep: any) => productIds.has(ep.product))
        })
      : embossingPlateList.value
    return filtered.map((e: any) => {
      const base = e.code ? `${e.name} (${e.code})` : e.name
      const names = (e.products || []).map((ep: any) => ep.product_name).filter(Boolean)
      const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
      return { value: e.id, label: `${base}${suffix}` }
    })
  })

  const requiredResources = computed(() => {
    const result = { artwork: false, die: false, foilingPlate: false, embossingPlate: false }
    // Note: processList is not available here; this computed is intended to be
    // composed with processList in the component or a higher-level composable.
    // To keep behavior identical, we leave the implementation that relies on
    // processList to the component, but we provide the shape.
    return result
  })

  return {
    artworkOptions,
    dieOptions,
    foilingPlateOptions,
    embossingPlateOptions,
    requiredResources
  }
}
