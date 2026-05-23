import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class WorkOrderProductAPI extends BaseAPI {
  constructor() {
    super('/workorder-products/', request)
  }
}

export const workOrderProductAPI = new WorkOrderProductAPI()
export default workOrderProductAPI
