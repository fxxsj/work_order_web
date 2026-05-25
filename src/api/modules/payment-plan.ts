import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class PaymentPlanAPI extends BaseAPI {
  constructor() {
    super('/payment-plans/', request)
  }
}

export const paymentPlanAPI = new PaymentPlanAPI()
export default paymentPlanAPI
