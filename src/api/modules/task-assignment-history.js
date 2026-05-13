import request from '@/api/index'

const taskAssignmentHistoryAPI = {
  getList(params) {
    return request.get('/api/tasks/assignment-history/', { params })
  },
  export(params) {
    return request.get('/api/tasks/assignment-history/export/', { params, responseType: 'blob' })
  }
}

export { taskAssignmentHistoryAPI }
export default taskAssignmentHistoryAPI
