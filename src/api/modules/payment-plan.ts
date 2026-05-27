import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class PaymentPlanAPI extends BaseAPI {
  constructor() {
    super('/payment-plans/', request)
  }

  getSummary(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}summary/`,
      method: 'get',
      params
    })
  }

  updateStatus(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/update_status/`,
      method: 'post'
    })
  }
}

export const paymentPlanAPI = new PaymentPlanAPI()
export default paymentPlanAPI
