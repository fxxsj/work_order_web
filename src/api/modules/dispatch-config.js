import request from '@/api/index'

const dispatchConfigAPI = {
  getList(params) {
    return request.get('/api/tasks/dispatch-config/', { params })
  },
  create(data) {
    return request.post('/api/tasks/dispatch-config/', data)
  },
  update(id, data) {
    return request.patch(`/api/tasks/dispatch-config/${id}/`, data)
  },
  delete(id) {
    return request.delete(`/api/tasks/dispatch-config/${id}/`)
  }
}

export { dispatchConfigAPI }
export default dispatchConfigAPI
