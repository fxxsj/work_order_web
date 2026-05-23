import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class StockAPI extends BaseAPI {
  constructor() {
    super('/stocks/', request)
  }

  adjust(id: number | string, data: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/adjust/`,
      method: 'post',
      data
    })
  }
}

export const stockAPI = new StockAPI()
export default stockAPI
