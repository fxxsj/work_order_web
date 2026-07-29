import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  artworkAPI,
  dieAPI,
  embossingPlateAPI,
  foilingPlateAPI,
  materialAPI,
  processAPI,
  productAPI,
  workOrderAPI
} from '@/api/modules'
import workOrderFormService from '@/services/WorkOrderFormService'

describe('WorkOrderFormService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(workOrderAPI, 'getSalesOrderCandidates').mockResolvedValue([])
    vi.spyOn(productAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(processAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(materialAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(artworkAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(dieAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(foilingPlateAPI, 'getList').mockResolvedValue({ results: [] })
    vi.spyOn(embossingPlateAPI, 'getList').mockResolvedValue({ results: [] })
  })

  it('includes the current work order when loading edit form candidates', async () => {
    await workOrderFormService.loadFormData('17')

    expect(workOrderAPI.getSalesOrderCandidates).toHaveBeenCalledWith({
      exclude_work_order_id: '17'
    })
  })

  it('does not send an exclusion parameter when creating a work order', async () => {
    await workOrderFormService.loadFormData()

    expect(workOrderAPI.getSalesOrderCandidates).toHaveBeenCalledWith(undefined)
  })
})
