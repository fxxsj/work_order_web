import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class SupplierAPI extends BaseAPI {
  constructor() {
    super('/suppliers/', request)
  }
}

export const supplierAPI = new SupplierAPI()
export default supplierAPI
