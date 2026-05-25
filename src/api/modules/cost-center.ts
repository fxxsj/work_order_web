import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class CostCenterAPI extends BaseAPI {
  constructor() {
    super('/cost-centers/', request)
  }
}

export const costCenterAPI = new CostCenterAPI()
export default costCenterAPI
