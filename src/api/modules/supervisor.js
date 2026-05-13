import request from '@/api/index'

const supervisorAPI = {
  getWorkload(params) {
    return request.get('/api/tasks/workload/', { params })
  },
  getDepartmentTasks(params) {
    return request.get('/api/tasks/department-stats/', { params })
  },
  assignTask(data) {
    return request.post('/api/tasks/assign/', data)
  },
  reassignTask(data) {
    return request.post('/api/tasks/reassign/', data)
  },
  getEmployeePerformance(params) {
    return request.get('/api/users/performance/', { params })
  }
}

export { supervisorAPI }
export default supervisorAPI
