import request from '@/api/index'

const supervisorAPI = {
  getWorkload(params: Record<string, unknown>) {
    return request({ url: '/api/tasks/workload/', method: 'get', params })
  },
  getDepartmentTasks(params: Record<string, unknown>) {
    return request({ url: '/api/tasks/department-stats/', method: 'get', params })
  },
  assignTask(data: unknown) {
    return request({ url: '/api/tasks/assign/', method: 'post', data })
  },
  reassignTask(data: unknown) {
    return request({ url: '/api/tasks/reassign/', method: 'post', data })
  },
  unassignTask(taskId: unknown) {
    return request({ url: `/api/tasks/${taskId}/unassign/`, method: 'post' })
  },
  getEmployeePerformance(params: Record<string, unknown>) {
    return request({ url: '/api/users/performance/', method: 'get', params })
  }
}

export { supervisorAPI }
export default supervisorAPI
