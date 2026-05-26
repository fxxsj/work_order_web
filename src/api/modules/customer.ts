import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class CustomerAPI extends BaseAPI {
  constructor() {
    super('/customers/', request)
  }

  /** 检查客户名称是否已存在（用于表单实时验证） */
  async checkName(name: string, excludeId?: number): Promise<boolean> {
    const params: Record<string, string> = { name }
    if (excludeId !== undefined) {
      params.exclude_id = String(excludeId)
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.request({ url: '/customers/check_name/', method: 'get', params }) as any
      const data = response?.data?.data
      return data?.exists === true
    } catch {
      // 如果检查失败（比如未登录），不阻止提交，让后端验证重复
      return false
    }
  }
}

export const customerAPI = new CustomerAPI()
export default customerAPI
