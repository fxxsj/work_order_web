import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class ProcessLogAPI extends BaseAPI {
  constructor() {
    super('/process-logs/', request)
  }
}

export const processLogAPI = new ProcessLogAPI()
export default processLogAPI
