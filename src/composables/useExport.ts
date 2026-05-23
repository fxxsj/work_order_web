import { ref } from 'vue'
import { ElMessageBox } from '@/utils/messageBox'

interface UseExportOptions {
  fileNamePrefix?: string
  fileExtension?: string
}

export function useExport(
  exportFn: (params: Record<string, unknown>) => Promise<Blob | Response | unknown>,
  options: UseExportOptions = {}
) {
  const { fileNamePrefix = 'export', fileExtension = 'xlsx' } = options

  const exporting = ref(false)

  const exportData = async (params: Record<string, unknown>, customFileName?: string) => {
    exporting.value = true
    try {
      const response = await exportFn(params)

      let blob: Blob
      if (response instanceof Blob) {
        blob = response
      } else if (response && typeof (response as Response).blob === 'function') {
        blob = await (response as Response).blob()
      } else {
        blob = new Blob([response as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = customFileName || `${fileNamePrefix}_${Date.now()}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (error: any) {
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
