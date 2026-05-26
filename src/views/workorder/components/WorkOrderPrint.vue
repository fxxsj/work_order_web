<template>
  <div>
    <div class="mb-6 flex justify-end gap-3 no-print">
      <button
        class="btn btn-primary"
        @click="handlePrint"
      >
        <Icon
          name="printer"
          class="h-4 w-4"
        /> 打印
      </button>
    </div>
    <div
      id="print-area"
      class="rounded-xl bg-white p-6"
    >
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold">
          {{ companyName }}
        </h1><h2 class="mt-2 text-xl">
          施工单详情
        </h2><div class="mt-4 flex justify-center gap-6 text-sm text-gray-500">
          <span>打印时间：{{ printTime }}</span><span>施工单号：{{ workOrder?.order_number }}</span>
        </div>
      </div>
      <div class="mb-6">
        <h3 class="mb-3 font-bold">
          基本信息
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              客户名称
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.customer_name }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              业务员
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.salesperson_name || salespersonName || '-' }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              产品名称
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.product_name || '-' }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              生产数量
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.production_quantity ?? workOrder?.quantity ?? displayQuantity }} {{ workOrder?.unit || '' }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              状态
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.status_display || workOrder?.status || '-' }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              审核状态
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.approval_status_display || workOrder?.approval_status || '-' }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              下单日期
            </th><td class="border border-gray-300 px-3 py-2">
              {{ formatDate(workOrder?.order_date) }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              交货日期
            </th><td class="border border-gray-300 px-3 py-2">
              {{ formatDate(workOrder?.delivery_date) }}
            </td>
          </tr>
        </table>
      </div>
      <div v-if="products?.length">
        <h3 class="mb-3 font-bold">
          产品列表
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              产品名称
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              规格
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              数量
            </th>
          </tr><tr
            v-for="(p, i) in products"
            :key="i"
          >
            <td class="border border-gray-300 px-3 py-2">
              {{ p.product_name }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.specification || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.quantity }} {{ p.unit }}
            </td>
          </tr>
        </table>
      </div>
      <div
        v-if="materials?.length"
        class="mt-6"
      >
        <h3 class="mb-3 font-bold">
          物料需求
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              物料
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              尺寸
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              用量
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              采购状态
            </th>
          </tr><tr
            v-for="(m, i) in materials"
            :key="i"
          >
            <td class="border border-gray-300 px-3 py-2">
              {{ m.material_name }} ({{ m.material_code || '-' }})
            </td><td class="border border-gray-300 px-3 py-2">
              {{ m.material_size || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ m.material_usage || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ m.purchase_status_display || m.purchase_status || '-' }}
            </td>
          </tr>
        </table>
      </div>
      <div
        v-if="processes?.length"
        class="mt-6"
      >
        <h3 class="mb-3 font-bold">
          工序与任务
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              序号
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              工序
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              状态
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              部门
            </th><th class="border border-gray-300 px-3 py-2 text-left">
              负责人
            </th>
          </tr><tr
            v-for="(p, i) in processes"
            :key="i"
          >
            <td class="border border-gray-300 px-3 py-2">
              {{ p.sequence ?? i + 1 }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.process_name || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.status_display || p.status || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.department_name || '-' }}
            </td><td class="border border-gray-300 px-3 py-2">
              {{ p.assigned_operator_name || '-' }}
            </td>
          </tr>
        </table>
      </div>
      <div class="mt-6">
        <h3 class="mb-3 font-bold">
          图稿与版材
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              图稿
            </th><td class="border border-gray-300 px-3 py-2">
              {{ joinResource(workOrder?.artwork_codes, workOrder?.artwork_names) }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              刀模
            </th><td class="border border-gray-300 px-3 py-2">
              {{ joinResource(workOrder?.die_codes, workOrder?.die_names) }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              烫金版
            </th><td class="border border-gray-300 px-3 py-2">
              {{ joinResource(workOrder?.foiling_plate_codes, workOrder?.foiling_plate_names) }}
            </td><th class="border border-gray-300 px-3 py-2 text-left">
              压凸版
            </th><td class="border border-gray-300 px-3 py-2">
              {{ joinResource(workOrder?.embossing_plate_codes, workOrder?.embossing_plate_names) }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              印刷要求
            </th><td
              colspan="3"
              class="border border-gray-300 px-3 py-2"
            >
              {{ [workOrder?.printing_colors_display, workOrder?.printing_type_display || workOrder?.printing_type].filter(Boolean).join(' ') || '-' }}
            </td>
          </tr>
        </table>
      </div>
      <div class="mt-6">
        <h3 class="mb-3 font-bold">
          备注与审批
        </h3><table class="w-full border-collapse border border-gray-300">
          <tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              备注
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.notes || '-' }}
            </td>
          </tr><tr>
            <th class="border border-gray-300 px-3 py-2 text-left">
              审批说明
            </th><td class="border border-gray-300 px-3 py-2">
              {{ workOrder?.approval_comment || workOrder?.rejection_reason || '-' }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

const props = defineProps({
  workOrder: { type: Object, default: null },
  products: { type: Array as any, default: () => [] },
  materials: { type: Array as any, default: () => [] },
  processes: { type: Array as any, default: () => [] },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: 0 },
  companyName: { type: String, default: '印刷公司' }
})

const printTime = new Date().toLocaleString('zh-CN')
const handlePrint = () => window.print()
const formatDate = (value: any) => value ? new Date(value).toLocaleDateString('zh-CN') : '-'
const joinResource = (codes: any, names: any) => {
  const safeCodes = Array.isArray(codes) ? codes.filter(Boolean) : []
  const safeNames = Array.isArray(names) ? names.filter(Boolean) : []
  if (!safeCodes.length && !safeNames.length) return '-'
  if (!safeCodes.length) return safeNames.join('、')
  return safeCodes.map((code: any, index: number) => {
    const name = safeNames[index]
    return name ? `${code} - ${name}` : code
  }).join('、')
}
</script>

<style scoped>
@media print { .no-print { display: none; } }
</style>
