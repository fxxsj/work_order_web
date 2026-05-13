import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

export function useExport(exportFn, options = {}) {
  const {
    fileNamePrefix = 'export',
    fileExtension = 'xlsx',
  } = options

  const exporting = ref(false)

  const exportData = async (params, customFileName) => {
    exporting.value = true
    try {
      const response = await exportFn(params)

      if (response?.blob) {
        const blob = response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = customFileName || `${fileNamePrefix}_${Date.now()}.${fileExtension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // 假设是 a标签下载
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = customFileName || `${fileNamePrefix}_${Date.now()}.${fileExtension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      return true
    } catch (error) {
      console.error('Export failed:', error)
      ElMessageBox.alert('导出失败', '错误', { type: 'error' })
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    exporting,
    exportData,
  }
}
