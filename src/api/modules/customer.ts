import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class CustomerAPI extends BaseAPI {
  constructor() {
    super('/customers/', request)
  }
}

export const customerAPI = new CustomerAPI()
export default customerAPI
