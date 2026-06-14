import { workOrderAPI, productAPI, processAPI, materialAPI, artworkAPI, dieAPI, foilingPlateAPI, embossingPlateAPI, salesOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

export interface FormDataLists {
  salesOrderList: any[]
  productList: any[]
  processList: any[]
  materialList: any[]
  artworkList: any[]
  dieList: any[]
  foilingPlateList: any[]
  embossingPlateList: any[]
}

export interface LoadingState {
  artworkLoading: boolean
  dieLoading: boolean
  foilingPlateLoading: boolean
  embossingPlateLoading: boolean
}

export interface LoadFormDataResult {
  lists: FormDataLists
  loading: LoadingState
}

class WorkOrderFormService {
  /**
   * Load all dropdown lists needed by the work order form in parallel.
   */
  async loadFormData(): Promise<LoadFormDataResult> {
    const lists: FormDataLists = {
      salesOrderList: [],
      productList: [],
      processList: [],
      materialList: [],
      artworkList: [],
      dieList: [],
      foilingPlateList: [],
      embossingPlateList: []
    }

    const loading: LoadingState = {
      artworkLoading: true,
      dieLoading: true,
      foilingPlateLoading: true,
      embossingPlateLoading: true
    }

    const setResults = (target: keyof FormDataLists, res: any) => {
      lists[target] = res?.results || res || []
    }

    const handleError = (error: any) => {
      ErrorHandler.handle(error)
    }

    await Promise.all([
      workOrderAPI.getSalesOrderCandidates()
        .then((res: any) => setResults('salesOrderList', res))
        .catch(handleError),
      productAPI.getList({ page_size: 50 })
        .then((res: any) => setResults('productList', res))
        .catch(handleError),
      processAPI.getList({ is_active: true, page_size: 100 })
        .then((res: any) => setResults('processList', res))
        .catch(handleError),
      materialAPI.getList({ page_size: 50 })
        .then((res: any) => setResults('materialList', res))
        .catch(handleError),
      artworkAPI.getList({ page_size: 50 })
        .then((res: any) => { setResults('artworkList', res); loading.artworkLoading = false; })
        .catch((error: any) => { handleError(error); loading.artworkLoading = false; }),
      dieAPI.getList({ page_size: 50 })
        .then((res: any) => { setResults('dieList', res); loading.dieLoading = false; })
        .catch((error: any) => { handleError(error); loading.dieLoading = false; }),
      foilingPlateAPI.getList({ page_size: 50 })
        .then((res: any) => { setResults('foilingPlateList', res); loading.foilingPlateLoading = false; })
        .catch((error: any) => { handleError(error); loading.foilingPlateLoading = false; }),
      embossingPlateAPI.getList({ page_size: 50 })
        .then((res: any) => { setResults('embossingPlateList', res); loading.embossingPlateLoading = false; })
        .catch((error: any) => { handleError(error); loading.embossingPlateLoading = false; })
    ])

    return { lists, loading }
  }

  async getWorkOrderDetail(workOrderId: string) {
    try {
      const res: any = await workOrderAPI.getDetail(workOrderId)
      return res
    } catch (error: any) {
      ErrorHandler.handle(error)
      throw error
    }
  }

  async getSalesOrderDetail(salesOrderId: string) {
    try {
      const res: any = await salesOrderAPI.getDetail(salesOrderId)
      return res
    } catch (error: any) {
      ErrorHandler.handle(error)
      throw error
    }
  }

  async createWorkOrder(payload: any) {
    try {
      const res: any = await workOrderAPI.create(payload)
      return res
    } catch (error: any) {
      ErrorHandler.handle(error)
      throw error
    }
  }

  async updateWorkOrder(id: string, payload: any) {
    try {
      const res: any = await workOrderAPI.update(id, payload)
      return res
    } catch (error: any) {
      ErrorHandler.handle(error)
      throw error
    }
  }

  async submitApproval(id: string | number, data: any) {
    try {
      const res: any = await workOrderAPI.submitApproval(id, data)
      return res
    } catch (error: any) {
      ErrorHandler.handle(error)
      throw error
    }
  }
}

export default new WorkOrderFormService()
