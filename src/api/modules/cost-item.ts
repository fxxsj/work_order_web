import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class CostItemAPI extends BaseAPI {
  constructor() {
    super('/cost-items/', request)
  }
}

export const costItemAPI = new CostItemAPI()
export default costItemAPI
