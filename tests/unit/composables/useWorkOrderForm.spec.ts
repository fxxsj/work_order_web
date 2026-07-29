import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useWorkOrderForm } from '@/composables/useWorkOrderForm'

const createForm = () => useWorkOrderForm({
  productList: ref([]),
  artworkList: ref([]),
  processList: ref([])
})

describe('useWorkOrderForm', () => {
  it('uses sales_order_id when prefilling the edit form', () => {
    const { form, setFormFromDetail } = createForm()

    setFormFromDetail({ sales_order_id: '42' }, ref([]))

    expect(form.sales_order_id).toBe(42)
  })

  it('keeps compatibility with the legacy sales_order field', () => {
    const { form, setFormFromDetail } = createForm()

    setFormFromDetail({ sales_order: { id: 24 } }, ref([]))

    expect(form.sales_order_id).toBe(24)
  })

  it('prefers sales_order_id when both fields are present', () => {
    const { form, setFormFromDetail } = createForm()

    setFormFromDetail({ sales_order_id: 42, sales_order: 24 }, ref([]))

    expect(form.sales_order_id).toBe(42)
  })
})
