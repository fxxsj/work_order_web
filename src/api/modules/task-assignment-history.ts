import request from '@/api/index'

const taskAssignmentHistoryAPI = {
  getList(params?: Record<string, unknown>) {
    return request({ url: '/api/tasks/assignment-history/', method: 'get', params })
  },
  getSummary(params?: Record<string, unknown>) {
    return request({ url: '/api/tasks/assignment-history/summary/', method: 'get', params })
  },
  export(params?: Record<string, unknown>) {
    return request({ url: '/api/tasks/assignment-history/export/', method: 'get', params, responseType: 'blob' })
  }
}

export { taskAssignmentHistoryAPI }
export default taskAssignmentHistoryAPI
