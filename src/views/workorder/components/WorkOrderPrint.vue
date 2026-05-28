<template>
  <div class="work-order-print">
    <div class="print-actions no-print">
      <button
        class="btn btn-primary"
        type="button"
        @click="handlePrint"
      >
        <Icon
          name="printer"
          class="h-4 w-4"
        />
        打印
      </button>
    </div>

    <article
      id="print-area"
      class="print-page"
    >
      <header class="print-header">
        <div class="print-title-block">
          <h1>{{ printableCompanyName }}</h1>
          <h2>施工单</h2>
        </div>
        <table class="top-meta">
          <tbody>
            <tr>
              <th>施工单号：</th>
              <td>{{ textValue(workOrder?.order_number || workOrder?.order_no) }}</td>
            </tr>
            <tr>
              <th>状态：</th>
              <td>{{ textValue(workOrder?.status_display || workOrder?.status) }}</td>
            </tr>
            <tr>
              <th>优先级：</th>
              <td>{{ textValue(workOrder?.priority_display || workOrder?.priority) }}</td>
            </tr>
          </tbody>
        </table>
      </header>

      <section class="date-strip">
        <div>下单日期：<span>{{ formatDate(workOrder?.order_date) }}</span></div>
        <div>交货日期：<span>{{ formatDate(workOrder?.delivery_date || workOrder?.expected_date) }}</span></div>
        <div>实际交货日期：<span class="date-line">{{ formatDate(workOrder?.actual_delivery_date, '') }}</span></div>
      </section>

      <section class="print-section">
        <table class="print-table info-table">
          <tbody>
            <tr>
              <th>客户：</th>
              <td>{{ textValue(workOrder?.customer_name || workOrder?.customer_detail?.name) }}</td>
              <th>来源客户订单：</th>
              <td>{{ sourceSalesOrderText }}</td>
            </tr>
            <tr>
              <th>备注：</th>
              <td colspan="3">{{ textValue(workOrder?.notes) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <table class="print-table print-info-grid">
          <thead>
            <tr>
              <th>印刷形式</th>
              <th>CMYK 颜色</th>
              <th>其他颜色</th>
              <th>生产数量</th>
              <th>预损数量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ textValue(workOrder?.printing_type_display || workOrder?.printing_type) }}</td>
              <td>{{ formatColorList(workOrder?.printing_cmyk_colors) }}</td>
              <td>{{ formatColorList(workOrder?.printing_other_colors) }}</td>
              <td>{{ quantityWithUnit(workOrder?.production_quantity ?? workOrder?.quantity ?? displayQuantity, '车头') }}</td>
              <td>{{ quantityWithUnit(workOrder?.defective_quantity, '车头') }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <table class="print-table product-table">
          <thead>
            <tr>
              <th class="col-index">序号</th>
              <th class="product-name-col">产品名称</th>
              <th class="product-spec-col">产品规格</th>
              <th class="product-quantity-col">数量</th>
              <th class="product-imposition-col">拼板数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in visibleProducts"
              :key="product.id || index"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ textValue(product.product_name || product.product_detail?.name) }}</td>
              <td>{{ textValue(product.specification || product.product_detail?.specification) }}</td>
              <td class="text-center">{{ productQuantityText(product) }}</td>
              <td class="text-center">{{ textValue(product.imposition_quantity) }}</td>
            </tr>
            <tr
              v-for="index in productBlankRows"
              :key="`product-blank-${index}`"
            >
              <td class="text-center">{{ visibleProducts.length + index }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="5" class="product-more">
                <span v-if="hiddenProductCount > 0">
                  以上仅显示前 3 个产品，其他还有 {{ hiddenProductCount }} 个产品。
                </span>
                <span v-else class="fixed-placeholder"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section">
        <table class="print-table plate-table">
          <thead>
            <tr>
              <th>图稿（CTP版）</th>
              <th>刀模</th>
              <th>烫金版</th>
              <th>压凸版</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ firstPlusCount(workOrder?.artwork_names, workOrder?.artwork_codes) }}</td>
              <td>{{ firstPlusCount(workOrder?.die_names, workOrder?.die_codes) }}</td>
              <td>{{ firstPlusCount(workOrder?.foiling_plate_names, workOrder?.foiling_plate_codes) }}</td>
              <td>{{ firstPlusCount(workOrder?.embossing_plate_names, workOrder?.embossing_plate_codes) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="plate-note">
          说明：括号内为其他数量，显示为“名称 + 余数”的方式。
        </div>
      </section>

      <section class="print-section process-section">
        <div class="process-grid">
          <label
            v-for="(process, index) in visibleProcessItems"
            :key="process.id || process.key || index"
            class="process-item"
          >
            <span class="checkbox-mark">☑</span>
            <span>{{ index + 1 }}. {{ process.label }}</span>
          </label>
          <label
            v-for="index in processBlankCells"
            :key="`process-blank-${index}`"
            class="process-item process-item-blank"
          >
            <span class="checkbox-mark">☐</span>
            <span></span>
          </label>
        </div>
        <div class="process-note">
          <span>其他说明：</span>
          <span class="note-line">
            <span v-if="hiddenProcessCount > 0">以上仅显示前 {{ processSlots }} 道工序，其他还有 {{ hiddenProcessCount }} 道工序。</span>
          </span>
        </div>
      </section>

      <section class="print-section material-section">
        <table class="print-table material-table">
          <thead>
            <tr>
              <th class="col-index">序号</th>
              <th>物料名称</th>
              <th>规格/尺寸</th>
              <th>用量</th>
              <th>是否开料</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(material, index) in visibleMaterials"
              :key="material.id || index"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ textValue(material.material_name) }}</td>
              <td>{{ textValue(material.material_size) }}</td>
              <td>{{ textValue(material.material_usage || material.quantity) }}</td>
              <td class="text-center">{{ material.need_cutting ? '是' : '否' }}</td>
              <td>{{ textValue(material.notes, '') }}</td>
            </tr>
            <tr
              v-for="index in materialBlankRows"
              :key="`material-blank-${index}`"
            >
              <td class="text-center">{{ visibleMaterials.length + index }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="print-section approval-section">
        <table class="print-table info-table">
          <tbody>
            <tr>
              <th>审批状态：</th>
              <td>{{ textValue(workOrder?.approval_status_display || workOrder?.approval_status) }}</td>
              <th>审批时间：</th>
              <td>{{ formatDateTime(workOrder?.approved_at) }}</td>
              <th>审批意见：</th>
              <td>{{ textValue(workOrder?.approval_comment || workOrder?.rejection_reason) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="signature-grid">
        <div class="signature-cell">
          <div>制表人（签字）：</div>
          <div class="signature-line"></div>
          <div class="signature-meta">
            <span>{{ textValue(workOrder?.manager_name, '') }}</span>
            <span>{{ formatDate(workOrder?.order_date, '') }}</span>
          </div>
        </div>
        <div class="signature-cell">
          <div>创建人（签字）：</div>
          <div class="signature-line"></div>
          <div class="signature-meta">
            <span>{{ textValue(workOrder?.created_by_name || workOrder?.creator_name, '') }}</span>
            <span>{{ formatDate(workOrder?.created_at, '') }}</span>
          </div>
        </div>
        <div class="signature-cell">
          <div>审核人（签字）：</div>
          <div class="signature-line"></div>
          <div class="signature-meta">
            <span>{{ textValue(workOrder?.approved_by_name, '') }}</span>
            <span>{{ formatDate(workOrder?.approved_at, '') }}</span>
          </div>
        </div>
        <div class="signature-cell">
          <div>业务员（签字）：</div>
          <div class="signature-line"></div>
          <div class="signature-meta">
            <span>{{ businessPersonName }}</span>
            <span>{{ formatDate(workOrder?.order_date, '') }}</span>
          </div>
        </div>
      </section>

      <footer class="print-footer">
        <div class="footer-note">注：请各相关部门严格按照本施工单安排生产，如有变更请及时反馈。</div>
        <div class="page-number">第 1 页 / 共 1 页</div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  workOrder: { type: Object, default: null },
  products: { type: Array as any, default: () => [] },
  materials: { type: Array as any, default: () => [] },
  processes: { type: Array as any, default: () => [] },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: 0 },
  companyName: { type: String, default: '' }
})

const productRows = 3
const materialRows = 8
const processSlots = 12

const handlePrint = () => window.print()

const asArray = (value: any) => Array.isArray(value) ? value.filter((item: any) => item !== null && item !== undefined && item !== '') : []
const textValue = (value: any, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const padDatePart = (value: number) => String(value).padStart(2, '0')

const formatDate = (value: any, fallback = '-') => {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
}

const formatDateTime = (value: any) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${formatDate(value)} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

const quantityWithUnit = (value: any, unit: string) => {
  if (value === null || value === undefined || value === '') return '-'
  return `${value} ${unit}`
}

const formatColorList = (value: any) => {
  if (!value) return '-'
  if (Array.isArray(value)) return value.length ? value.join('、') : '-'
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== '')
    return entries.length ? entries.map(([key, item]) => `${key}:${item}`).join('  ') : '-'
  }
  return String(value)
}

const firstPlusCount = (names: any, codes: any) => {
  const displayItems = asArray(names).length ? asArray(names) : asArray(codes)
  if (!displayItems.length) return '-'
  const first = textValue(displayItems[0])
  return displayItems.length > 1 ? `${first} +${displayItems.length - 1}` : first
}

const visibleProducts = computed(() => asArray(props.products).slice(0, productRows))
const hiddenProductCount = computed(() => Math.max(asArray(props.products).length - productRows, 0))
const productBlankRows = computed(() => Math.max(productRows - visibleProducts.value.length, 0))
const visibleMaterials = computed(() => asArray(props.materials).slice(0, materialRows))
const materialBlankRows = computed(() => Math.max(materialRows - visibleMaterials.value.length, 0))

const actualProcessItems = computed(() =>
  asArray(props.processes)
    .map((process: any, index: number) => ({
      id: process.id,
      key: process.process_code || process.code || process.id || index,
      sequence: Number(process.sequence ?? process.sort_order ?? process.order ?? index + 1),
      label: textValue(
        process.process_name ||
          process.name ||
          process.process_detail?.name ||
          process.process?.name ||
          process.process_code ||
          process.code,
        ''
      )
    }))
    .filter((process: any) => process.label)
    .sort((a: any, b: any) => a.sequence - b.sequence)
)

const visibleProcessItems = computed(() => actualProcessItems.value.slice(0, processSlots))
const hiddenProcessCount = computed(() => Math.max(actualProcessItems.value.length - processSlots, 0))
const processBlankCells = computed(() => Math.max(processSlots - visibleProcessItems.value.length, 0))

const productQuantityText = (product: any) => {
  const quantity = textValue(product?.quantity, '')
  const unit = textValue(product?.unit || product?.product_detail?.unit, '')
  return [quantity, unit].filter(Boolean).join(' ') || '-'
}

const printableCompanyName = computed(() =>
  textValue(props.workOrder?.company_name || props.companyName, '')
)

const sourceSalesOrderText = computed(() => {
  const summaries = asArray(props.workOrder?.sales_order_summaries)
  return textValue(
    props.workOrder?.sales_order_number ||
      props.workOrder?.source_sales_order_number ||
      asArray(props.workOrder?.sales_order_numbers)[0] ||
      summaries[0]?.number
  )
})

const businessPersonName = computed(() =>
  textValue(
    props.workOrder?.salesperson_name ||
      props.workOrder?.customer_detail?.salesperson_name ||
      props.salespersonName,
    ''
  )
)

</script>

<style scoped>
.work-order-print {
  background: #eef0f2;
  padding: 18px 0 28px;
}

.work-order-print,
.work-order-print * {
  box-sizing: border-box;
}

.print-actions {
  display: flex;
  justify-content: flex-end;
  margin: 0 auto 14px;
  width: 210mm;
}

.print-page {
  background: #fff;
  color: #111;
  display: flex;
  flex-direction: column;
  font-family: "SimSun", "Songti SC", "Noto Serif CJK SC", serif;
  font-size: 10.6px;
  height: 297mm;
  line-height: 1.28;
  margin: 0 auto;
  overflow: hidden;
  padding: 6mm;
  width: 210mm;
}

.print-header {
  align-items: start;
  display: grid;
  grid-template-columns: 1fr 58mm;
  margin-bottom: 3mm;
}

.print-title-block {
  padding-left: 44mm;
  text-align: center;
}

.print-title-block h1 {
  font-size: 27px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.15;
  margin: 0;
}

.print-title-block h2 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 3mm 0 0;
}

.top-meta {
  border-collapse: collapse;
  font-size: 12px;
  width: 100%;
}

.top-meta th,
.top-meta td {
  border: 0;
  font-weight: 700;
  padding: 1.35mm 0;
  text-align: left;
  white-space: nowrap;
}

.top-meta th {
  width: 23mm;
}

.date-strip {
  display: grid;
  font-size: 12px;
  font-weight: 700;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 3mm;
}

.date-strip span {
  font-weight: 400;
  margin-left: 5mm;
}

.date-line {
  border-bottom: 1px solid #111;
  display: inline-block;
  min-height: 4.8mm;
  min-width: 28mm;
  text-align: center;
}

.print-section {
  margin-top: 3mm;
}

.print-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.print-table th,
.print-table td {
  border: 1px solid #111;
  color: #111;
  overflow: hidden;
  padding: 1.75mm 1.9mm;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.print-table th {
  font-weight: 800;
}

.info-table th {
  text-align: left;
  width: 31mm;
}

.info-table td {
  height: 8mm;
}

.product-table th,
.product-table td,
.print-info-grid th,
.print-info-grid td,
.material-table th,
.material-table td,
.plate-table th,
.plate-table td {
  text-align: center;
}

.product-table tbody td {
  height: 8mm;
}

.product-table .product-name-col {
  width: 36%;
}

.product-table .product-spec-col {
  width: 36%;
}

.product-table .product-quantity-col {
  width: 14%;
}

.product-table .product-imposition-col {
  width: 10%;
}

.product-table .product-more {
  font-weight: 700;
  height: 7mm;
  text-align: left;
}

.fixed-placeholder {
  display: block;
  height: 3mm;
}

.print-info-grid {
  font-size: 10.6px;
}

.print-info-grid th,
.print-info-grid td {
  height: 8mm;
}

.plate-table td {
  height: 11mm;
  font-size: 11px;
}

.plate-note {
  border: 1px solid #111;
  border-top: 0;
  font-size: 11px;
  height: 7mm;
  padding: 1.55mm 2.4mm;
}

.process-grid {
  border-left: 1px solid #111;
  border-top: 1px solid #111;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.process-item {
  align-items: center;
  border-bottom: 1px solid #111;
  border-right: 1px solid #111;
  display: flex;
  font-size: 11px;
  gap: 1.5mm;
  height: 7mm;
  padding: 0 3mm;
  white-space: nowrap;
}

.checkbox-mark {
  font-family: "SimSun", serif;
  font-size: 13px;
  line-height: 1;
}

.process-note {
  align-items: center;
  border: 1px solid #111;
  border-top: 0;
  display: flex;
  font-size: 11px;
  gap: 3mm;
  height: 7mm;
  padding: 0 3mm;
}

.note-line {
  border-bottom: 1px solid #111;
  flex: 1;
  height: 3.5mm;
}

.material-table {
  font-size: 10.2px;
}

.material-table th,
.material-table td {
  height: 7.2mm;
  padding: 1.1mm 1.25mm;
}

.material-table .col-index,
.product-table .col-index {
  width: 9mm;
}

.approval-section .info-table th {
  width: 22mm;
}

.signature-grid {
  border-left: 1px solid #111;
  border-top: 1px solid #111;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 3mm;
}

.signature-cell {
  border-bottom: 1px solid #111;
  border-right: 1px solid #111;
  font-size: 11px;
  height: 19mm;
  padding: 2mm 4mm 1.2mm;
}

.signature-line {
  border-bottom: 1px solid #111;
  height: 5.8mm;
  margin-top: 2.2mm;
}

.signature-meta {
  display: flex;
  gap: 3mm;
  height: 4mm;
  justify-content: center;
  margin-top: 1mm;
  text-align: center;
}

.print-footer {
  font-size: 11px;
  margin-top: auto;
  padding: 2.2mm 2mm 0;
}

.footer-note {
  line-height: 1.2;
}

.page-number {
  font-size: 12px;
  line-height: 1.2;
  margin-top: 1.4mm;
  text-align: center;
}

.text-center {
  text-align: center;
}

@page {
  margin: 0;
  size: A4 portrait;
}

@media print {
  :global(html),
  :global(body) {
    background: #fff !important;
    height: 297mm;
    margin: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    width: 210mm;
  }

  :global(body > *:not(.modal-overlay)) {
    display: none !important;
  }

  :global(.no-print),
  :global(.modal-header),
  :global(.modal-footer) {
    display: none !important;
  }

  :global(.modal-overlay),
  :global(.modal-content),
  :global(.modal-body) {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    display: block !important;
    height: auto !important;
    inset: auto !important;
    margin: 0 !important;
    max-height: none !important;
    max-width: none !important;
    overflow: visible !important;
    padding: 0 !important;
    position: static !important;
    width: auto !important;
  }

  .work-order-print {
    background: #fff !important;
    padding: 0 !important;
  }

  .print-page {
    box-shadow: none !important;
    height: 297mm;
    margin: 0 !important;
    overflow: hidden;
    page-break-after: avoid;
    page-break-before: avoid;
    page-break-inside: avoid;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    width: 210mm;
  }
}
</style>
