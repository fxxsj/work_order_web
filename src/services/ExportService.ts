/**
 * 导出服务
 *
 * 提供统一的导出功能，支持导出为 Excel、CSV 等格式
 */

import BaseService from './base/BaseService'
import * as XLSX from 'xlsx'
import logger from '@/utils/logger'

export interface ExportColumn {
  field: string
  label: string
  formatter?: (value: unknown, row: Record<string, unknown>) => unknown
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  columns?: ExportColumn[]
  title?: string | null
  author?: string
}

export interface ExportResult {
  success: boolean
  message?: string
  error?: string
}

export interface PrintOptions {
  title?: string
  columns?: ExportColumn[]
  pageSize?: string
  orientation?: 'portrait' | 'landscape'
}

export interface PrintData {
  title: string
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  pageSize: string
  orientation: string
  totalCount: number
  printTime: string
}

class ExportService extends BaseService {
  constructor() {
    super(null) // ExportService 不需要 API 客户端
  }

  async exportToExcel(data: Record<string, unknown>[], options: ExportOptions = {}): Promise<ExportResult> {
    const {
      filename = 'export',
      sheetName = 'Sheet1',
      columns = [],
      title = null,
      author = '印刷施工单系统'
    } = options

    try {
      const workbook = XLSX.utils.book_new()
      const worksheetData = this._prepareWorksheetData(data, columns)
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      if (columns.length > 0) {
        const colWidths = columns.map((col: any) => {
          const maxWidth = Math.max(
            col.label.length,
            ...data.map((row: any) => String(row[col.field] || '').length)
          )
          return { wch: maxWidth + 2 }
        })
        worksheet['!cols'] = colWidths
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      workbook.Props = {
        Title: title || filename,
        Subject: filename,
        Author: author,
        CreatedDate: new Date()
      }

      XLSX.writeFile(workbook, `${filename}.xlsx`)

      return {
        success: true,
        message: `导出成功：${filename}.xlsx`
      }
    } catch (error: any) {
      logger.error('Export Error', error)
      return {
        success: false,
        error: '导出失败：' + (error as Error).message
      }
    }
  }

  async exportToCSV(data: Record<string, unknown>[], options: { filename?: string; columns?: ExportColumn[]; separator?: string } = {}): Promise<ExportResult> {
    const {
      filename = 'export',
      columns = [],
      separator = ','
    } = options

    try {
      const headers = columns.map((col: any) => col.label).join(separator)
      const rows = data.map((row: any) =>
        columns.map((col: any) => {
          let value = row[col.field]
          if (typeof value === 'string' && value.includes(separator)) {
            value = `"${value}"`
          }
          return value || ''
        }).join(separator)
      )

      const csv = [headers, ...rows].join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      this._downloadBlob(blob, `${filename}.csv`)

      return {
        success: true,
        message: `导出成功：${filename}.csv`
      }
    } catch (error: any) {
      logger.error('Export Error', error)
      return {
        success: false,
        error: '导出失败：' + (error as Error).message
      }
    }
  }

  async exportTasks(tasks: Record<string, unknown>[]): Promise<ExportResult> {
    const columns: ExportColumn[] = [
      { field: 'id', label: '任务ID' },
      { field: 'work_order', label: '施工单号', formatter: (value: any) => (value as Record<string, unknown>)?.order_number || '' },
      { field: 'process_name', label: '工序名称' },
      { field: 'work_content', label: '工作内容' },
      { field: 'task_type_display', label: '任务类型' },
      { field: 'production_quantity', label: '生产数量' },
      { field: 'quantity_completed', label: '完成数量' },
      { field: 'quantity_defective', label: '不良品数量' },
      { field: 'status_display', label: '状态' },
      { field: 'assigned_department_name', label: '分派部门' },
      { field: 'assigned_operator_name', label: '分派操作员' },
      { field: 'created_at', label: '创建时间', formatter: (value: any) => this._formatDate(value as string | Date) }
    ]

    const exportData = tasks.map((task: any) => {
      const row: Record<string, unknown> = {}
      columns.forEach((col: any) => {
        let value = task[col.field]
        if (col.formatter) {
          value = col.formatter(value, task)
        }
        row[col.field] = value
      })
      return row
    })

    const dateStr = this._formatDate(new Date(), 'YYYYMMDD_HHmmss')
    const filename = `任务列表_${dateStr}`

    return this.exportToExcel(exportData, {
      filename,
      sheetName: '任务列表',
      columns,
      title: '任务列表导出'
    })
  }

  async exportWorkOrders(workOrders: Record<string, unknown>[]): Promise<ExportResult> {
    const columns: ExportColumn[] = [
      { field: 'order_number', label: '施工单号' },
      { field: 'customer_name', label: '客户名称' },
      { field: 'product_name', label: '产品名称' },
      { field: 'quantity', label: '数量' },
      { field: 'unit', label: '单位' },
      { field: 'status_display', label: '状态' },
      { field: 'priority_display', label: '优先级' },
      { field: 'order_date', label: '下单日期', formatter: (value: any) => this._formatDate(value as string | Date) },
      { field: 'delivery_date', label: '交货日期', formatter: (value: any) => this._formatDate(value as string | Date) },
      { field: 'production_quantity', label: '生产数量' },
      { field: 'progress_percentage', label: '完成进度(%)', formatter: (value: any) => value || 0 },
      { field: 'manager_name', label: '制单人' },
      { field: 'created_at', label: '创建时间', formatter: (value: any) => this._formatDate(value as string | Date) }
    ]

    const exportData = workOrders.map(wo => {
      const row: Record<string, unknown> = {}
      columns.forEach((col: any) => {
        let value = wo[col.field]
        if (col.formatter) {
          value = col.formatter(value, wo)
        }
        row[col.field] = value
      })
      return row
    })

    const dateStr = this._formatDate(new Date(), 'YYYYMMDD_HHmmss')
    const filename = `施工单列表_${dateStr}`

    return this.exportToExcel(exportData, {
      filename,
      sheetName: '施工单列表',
      columns,
      title: '施工单列表导出'
    })
  }

  _prepareWorksheetData(data: Record<string, unknown>[], columns: ExportColumn[]): Record<string, unknown>[] {
    if (columns.length === 0) {
      return data
    }

    return data.map((row: any) => {
      const newRow: Record<string, unknown> = {}
      columns.forEach((col: any) => {
        newRow[col.label] = col.formatter
          ? col.formatter(row[col.field], row)
          : row[col.field] || ''
      })
      return newRow
    })
  }

  _downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  _formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
    if (!date) {
      return ''
    }

    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return ''
    }

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  preparePrintData(data: Record<string, unknown>[], options: PrintOptions = {}): PrintData {
    const {
      title = '',
      columns = [],
      pageSize = 'A4',
      orientation = 'portrait'
    } = options

    return {
      title,
      data,
      columns,
      pageSize,
      orientation,
      totalCount: data.length,
      printTime: new Date().toLocaleString()
    }
  }

  generatePrintHTML(printData: PrintData): string {
    const { title, data, columns, printTime } = printData

    const headerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1>${title}</h1>
        <p style="color: #666;">打印时间：${printTime}</p>
      </div>
    `

    const tableHeader = `
      <thead>
        <tr>
          ${columns.map((col: any) => `<th>${col.label}</th>`).join('')}
        </tr>
      </thead>
    `

    const tableBody = `
      <tbody>
        ${data.map((row: any) => `
          <tr>
            ${columns.map((col: any) => `
              <td>${row[col.field] || ''}</td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    `

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { padding: 0; }
            th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${headerHTML}
        <table>
          ${tableHeader}
          ${tableBody}
        </table>
      </body>
      </html>
    `
  }

  print(printData: PrintData): void {
    const html = this.generatePrintHTML(printData)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }
}

const exportService = new ExportService()

export default exportService
