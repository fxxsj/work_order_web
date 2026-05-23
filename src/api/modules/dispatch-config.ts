import request from '@/api/index'

const dispatchConfigAPI = {
  getList(params?: Record<string, unknown>) {
    return request({ url: '/api/tasks/dispatch-config/', method: 'get', params })
  },
  get() {
    return request({ url: '/api/tasks/dispatch-config/', method: 'get' })
  },
  create(data: unknown) {
    return request({ url: '/api/tasks/dispatch-config/', method: 'post', data })
  },
  update(idOrData: number | string | Record<string, unknown>, data?: unknown) {
    if (typeof idOrData === 'object') {
      return request({ url: '/api/tasks/dispatch-config/', method: 'patch', data: idOrData })
    }
    return request({ url: `/api/tasks/dispatch-config/${idOrData}/`, method: 'patch', data })
  },
  delete(id: number | string) {
    return request({ url: `/api/tasks/dispatch-config/${id}/`, method: 'delete' })
  }
}

export { dispatchConfigAPI }
export default dispatchConfigAPI
