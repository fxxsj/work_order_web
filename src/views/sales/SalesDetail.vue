<template>
  <div class="relative">
    <LoadingOverlay :show="loading" />
    <div v-if="!loading && detailData.id">
      <div class="space-y-6">
        <!-- 顶部操作栏 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <button
            class="btn btn-secondary"
            @click="goBack"
          >
            <Icon
              name="arrowLeft"
              class="h-4 w-4"
            />
            返回
          </button>
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-if="canEdit && detailData.approval_status === 'draft'"
              class="btn btn-primary"
              @click="handleEdit"
            >
              <Icon
                name="edit"
                class="h-4 w-4"
              />
              编辑
            </button>
            <button
              v-if="canConvert && detailData.approval_status === 'approved' && !['completed', 'cancelled'].includes(detailData.status)"
              class="btn btn-success"
              @click="handleConvert"
            >
              <Icon
                name="plus"
                class="h-4 w-4"
              />
              生成施工单
            </button>
            <button
              v-if="canCreateDelivery && detailData.approval_status === 'approved'"
              class="btn btn-secondary"
              @click="handleCreateDeliveryOrder"
            >
              <Icon
                name="truck"
                class="h-4 w-4"
              />
              生成送货单
            </button>
          </div>
        </div>

        <!-- 基本信息 -->
        <section class="card p-6">
          <div class="mb-4 border-b border-gray-200 pb-4 dark:border-dark-700">
            <span class="text-lg font-bold text-gray-900 dark:text-white">
              客户订单 · {{ detailData.order_number }}
            </span>
          </div>
          <DescriptionGrid :columns="3">
            <DescriptionItem label="订单号">
              {{ detailData.order_number }}
            </DescriptionItem>
            <DescriptionItem label="客户">
              {{ detailData.customer_name }}
            </DescriptionItem>
            <DescriptionItem label="合同号">
              {{ detailData.contract_number || '-' }}
            </DescriptionItem>
            <DescriptionItem label="订单日期">
              {{ formatDate(detailData.order_date) }}
            </DescriptionItem>
            <DescriptionItem label="预计交货">
              {{ formatDate(detailData.delivery_date) }}
            </DescriptionItem>
            <DescriptionItem label="实际交货">
              {{ formatDate(detailData.actual_delivery_date) || '-' }}
            </DescriptionItem>
            <DescriptionItem label="联系人">
              {{ detailData.contact_person || '-' }}
            </DescriptionItem>
            <DescriptionItem label="联系电话">
              {{ detailData.contact_phone || '-' }}
            </DescriptionItem>
            <DescriptionItem label="状态">
              <StatusTag
                :status="detailData.status"
                :label="detailData.status_display"
                category="salesOrder"
                size="small"
              />
            </DescriptionItem>
            <DescriptionItem
              label="送货地址"
              :span="3"
            >
              {{ detailData.shipping_address || '-' }}
            </DescriptionItem>
          </DescriptionGrid>
        </section>

        <!-- 拒绝信息 -->
        <section
          v-if="detailData.status === 'rejected' && (detailData.rejection_reason || detailData.approval_comment)"
          class="card border-l-4 border-warning-500 p-6"
        >
          <div class="mb-2 text-sm font-medium text-warning-600">
            审核拒绝
          </div>
          <div
            v-if="detailData.rejection_reason"
            class="mb-1 text-sm text-gray-700 dark:text-dark-300"
          >
            <span class="text-gray-500 dark:text-dark-400">拒绝原因：</span>{{ detailData.rejection_reason }}
          </div>
          <div
            v-if="detailData.approval_comment"
            class="mb-3 text-sm text-gray-700 dark:text-dark-300"
          >
            <span class="text-gray-500 dark:text-dark-400">审批说明：</span>{{ detailData.approval_comment }}
          </div>
          <div class="flex items-center gap-3 border-t border-warning-200 pt-3 dark:border-warning-800">
            <span class="text-xs text-gray-500 dark:text-dark-400">下一步：</span>
            <button
              v-if="salesorderApprovalEnabled"
              class="btn btn-primary btn-sm"
              @click="handleSubmitOrder"
            >
              <Icon
                name="upload"
                class="h-3 w-3"
              />
              重新提交
            </button>
            <button
              v-if="canEdit"
              class="btn btn-secondary btn-sm"
              @click="handleEdit"
            >
              <Icon
                name="edit"
                class="h-3 w-3"
              />
              先去修改
            </button>
          </div>
        </section>

        <!-- 人工完结 -->
        <section
          v-if="detailData.completion_reason"
          class="card border-l-4 p-6"
          :class="'border-warning-500'"
        >
          <div class="mb-1 text-sm font-medium text-warning-600">
            人工完结
          </div>
          <div class="text-sm text-gray-700 dark:text-dark-300">
            {{ detailData.completion_reason }}
          </div>
        </section>

        <!-- Tab 切换 -->
        <div class="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700">
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="tab in detailTabs"
                :key="tab.key"
                class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
                :class="activeDetailTab === tab.key ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-white'"
                @click="activeDetailTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- 订单明细 Tab -->
          <div
            v-show="activeDetailTab === 'detail'"
            class="p-4 sm:p-6"
          >
            <div class="card p-6">
              <SummaryTable
                :columns="itemColumns"
                :data="detailData.items || []"
                row-key="id"
              >
                <template #cell-product_name="{ row }">
                  {{ row.product_name }}
                  <span
                    v-if="row.product_code"
                    class="text-xs text-gray-400"
                  >({{ row.product_code }})</span>
                </template>
                <template #cell-unit_price="{ row }">
                  {{ formatAmount(row.unit_price) }}
                </template>
                <template #cell-tax_rate="{ row }">
                  {{ row.tax_rate != null ? row.tax_rate + '%' : '-' }}
                </template>
                <template #cell-discount_amount="{ row }">
                  {{ (row.discount_amount || 0) > 0 ? formatAmount(row.discount_amount) : '-' }}
                </template>
                <template #cell-amount="{ row }">
                  <span class="font-medium">{{ formatAmount((row.quantity || 0) * (row.unit_price || 0) - (row.discount_amount || 0)) }}</span>
                </template>
              </SummaryTable>
            </div>
          </div>

          <!-- 金额信息 Tab -->
          <div
            v-show="activeDetailTab === 'finance'"
            class="space-y-6 p-4 sm:p-6"
          >
            <!-- 金额明细 -->
            <div>
              <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                金额明细
              </div>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    小计
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatAmount(detailData.subtotal) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    税额 ({{ detailData.tax_rate || 0 }}%)
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatAmount(detailData.tax_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    折扣
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    -{{ formatAmount(detailData.discount_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    合计
                  </div>
                  <div class="mt-2 text-base font-semibold text-primary-600">
                    {{ formatAmount(detailData.total_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    已付款
                  </div>
                  <div class="mt-2 text-base font-semibold text-success-600">
                    {{ formatAmount(detailData.paid_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    未付款
                  </div>
                  <div
                    class="mt-2 text-base font-semibold"
                    :class="(detailData.unpaid_amount || 0) > 0 ? 'text-danger-600' : 'text-gray-900 dark:text-white'"
                  >
                    {{ formatAmount(detailData.unpaid_amount) }}
                  </div>
                </div>
              </div>
              <div class="mt-4 grid gap-4 sm:grid-cols-3">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    定金
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatAmount(detailData.deposit_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    付款日期
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatDate(detailData.payment_date) || '-' }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    收款次数
                  </div>
                  <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                    {{ detailData.payment_count ?? '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 财务摘要 -->
            <div>
              <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                财务摘要
              </div>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    订单金额
                  </div>
                  <div class="mt-1 text-base font-semibold text-primary-600">
                    {{ formatAmount(detailData.total_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    已回款
                  </div>
                  <div class="mt-1 text-base font-semibold text-success-600">
                    {{ formatAmount(detailData.paid_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    未回款
                  </div>
                  <div
                    class="mt-1 text-base font-semibold"
                    :class="(detailData.unpaid_amount || 0) > 0 ? 'text-danger-600' : 'text-gray-900 dark:text-white'"
                  >
                    {{ formatAmount(detailData.unpaid_amount) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    付款状态
                  </div>
                  <div class="mt-1">
                    <StatusTag
                      :status="detailData.payment_status"
                      :label="detailData.payment_status_display"
                      category="payment"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    关联发票
                  </div>
                  <div class="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {{ getRelatedNumbers('invoice').length }} 张
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    收款记录
                  </div>
                  <div class="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {{ detailData.payment_count ?? 0 }} 次
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    待收款计划
                  </div>
                  <div class="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {{ detailData.pending_payment_plan_count ?? 0 }} 笔
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                  <div class="text-xs text-gray-500 dark:text-dark-400">
                    待收金额
                  </div>
                  <div
                    class="mt-1 text-base font-semibold"
                    :class="(detailData.pending_payment_plan_amount || 0) > 0 ? 'text-warning-600' : 'text-gray-900 dark:text-white'"
                  >
                    {{ formatAmount(detailData.pending_payment_plan_amount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <section
          v-if="detailData.notes"
          class="card p-6"
        >
          <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            备注
          </div>
          <div class="whitespace-pre-wrap text-sm text-gray-700 dark:text-dark-300">
            {{ detailData.notes }}
          </div>
        </section>

        <!-- 上下游关联 -->
        <section
          v-if="hasRelatedOrders"
          class="card p-6"
        >
          <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            上下游关联
          </div>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
              <div class="mb-2 text-xs font-medium text-gray-500 dark:text-dark-400">
                关联施工单
              </div>
              <template v-if="getRelatedNumbers('work_order').length > 0">
                <div
                  v-for="(num, idx) in getRelatedNumbers('work_order')"
                  :key="idx"
                  class="text-sm"
                >
                  <span
                    class="cursor-pointer text-primary-600 hover:underline dark:text-primary-400"
                    @click="navigateToRelated('workorder', Number(getRelatedId('work_order', Number(idx))))"
                  >
                    {{ num }}
                    <Icon
                      name="arrowRight"
                      class="ml-0.5 inline h-3 w-3"
                    />
                  </span>
                </div>
              </template>
              <div
                v-else
                class="text-sm text-gray-400"
              >
                暂无
              </div>
            </div>
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
              <div class="mb-2 text-xs font-medium text-gray-500 dark:text-dark-400">
                关联送货单
              </div>
              <template v-if="getRelatedNumbers('delivery_order').length > 0">
                <div
                  v-for="(num, idx) in getRelatedNumbers('delivery_order')"
                  :key="idx"
                  class="text-sm text-gray-900 dark:text-white"
                >
                  {{ num }}
                </div>
              </template>
              <div
                v-else
                class="text-sm text-gray-400"
              >
                暂无
              </div>
            </div>
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
              <div class="mb-2 text-xs font-medium text-gray-500 dark:text-dark-400">
                关联发票
              </div>
              <template v-if="getRelatedNumbers('invoice').length > 0">
                <div
                  v-for="(num, idx) in getRelatedNumbers('invoice')"
                  :key="idx"
                  class="text-sm text-gray-900 dark:text-white"
                >
                  {{ num }}
                </div>
              </template>
              <div
                v-else
                class="text-sm text-gray-400"
              >
                暂无
              </div>
            </div>
          </div>
        </section>

        <!-- 操作历史 -->
        <section
          v-if="operationHistory.length > 0"
          class="card p-6"
        >
          <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            操作历史
          </div>
          <div class="space-y-0 border-l-2 border-gray-200 dark:border-dark-700 ml-3">
            <div
              v-for="(item, index) in operationHistory"
              :key="index"
              class="relative pl-6 pb-6"
            >
              <div class="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary-500 bg-white dark:bg-dark-800" />
              <div class="mb-1 text-xs text-gray-400 dark:text-dark-500">
                {{ item.created_at }}
              </div>
              <p class="text-sm text-gray-900 dark:text-white">
                <StatusTag
                  :status="item.new_status"
                  :label="item.action_display"
                  category="salesOrder"
                  size="small"
                />
                <span class="ml-2 text-gray-500 dark:text-dark-400">{{ item.operator_name }}</span>
              </p>
              <p
                v-if="item.notes"
                class="mt-1 text-xs text-gray-500 dark:text-dark-400"
              >
                {{ item.notes }}
              </p>
            </div>
          </div>
        </section>

        <!-- 状态操作 -->
        <section class="card p-6">
          <div class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            订单操作
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              v-if="detailData.approval_status === 'draft' && salesorderApprovalEnabled"
              class="btn btn-primary"
              @click="handleSubmitOrder"
            >
              <Icon
                name="upload"
                class="h-4 w-4"
              />
              提交审核
            </button>
            <template v-if="detailData.approval_status === 'submitted' && salesorderApprovalEnabled">
              <button
                v-if="canApprove"
                class="btn btn-success"
                @click="handleApproveOrder"
              >
                <Icon
                  name="check"
                  class="h-4 w-4"
                />
                审核通过
              </button>
              <button
                class="btn btn-warning"
                @click="handleRejectOrder"
              >
                <Icon
                  name="x"
                  class="h-4 w-4"
                />
                审核拒绝
              </button>
            </template>
            <template v-if="canChange && detailData.approval_status === 'approved' && !['completed', 'cancelled'].includes(detailData.status)">
              <button
                class="btn btn-secondary"
                @click="handleUpdatePayment"
              >
                <Icon
                  name="creditCard"
                  class="h-4 w-4"
                />
                更新付款
              </button>
              <button
                class="btn btn-success"
                @click="handleCompleteOrder"
              >
                <Icon
                  name="checkCircle"
                  class="h-4 w-4"
                />
                完成订单
              </button>
            </template>
            <button
              v-if="canChange && detailData.status && !['completed', 'cancelled'].includes(detailData.status)"
              class="btn btn-danger"
              @click="handleCancelOrder"
            >
              <Icon
                name="xCircle"
                class="h-4 w-4"
              />
              取消订单
            </button>
            <button
              v-if="detailData.approval_status === 'draft' && canChange"
              class="btn btn-danger"
              @click="handleDeleteOrder"
            >
              <Icon
                name="trash"
                class="h-4 w-4"
              />
              删除
            </button>
          </div>
        </section>
      </div>
    </div>
    <div
      v-else-if="!loading"
      class="p-10 text-center text-gray-500 dark:text-dark-400"
    >
      未找到订单信息
    </div>

    <!-- 对话框：审核拒绝 -->
    <ConfirmDialog
      :show="showRejectDialog"
      title="审核拒绝"
      message="请填写拒绝原因。"
      confirm-text="拒绝"
      cancel-text="取消"
      :danger="true"
      :loading="rejecting"
      loading-text="处理中..."
      @confirm="confirmReject"
      @cancel="cancelReject"
    >
      <TextArea
        v-model="rejectReason"
        label="拒绝原因"
        :rows="3"
        placeholder="请输入拒绝原因"
      />
    </ConfirmDialog>

    <!-- 对话框：更新付款 -->
    <ConfirmDialog
      :show="showPaymentDialog"
      title="更新付款信息"
      message="更新订单的付款信息"
      confirm-text="确认"
      cancel-text="取消"
      :loading="paymentLoading"
      loading-text="处理中..."
      @confirm="confirmPayment"
      @cancel="showPaymentDialog = false"
    >
      <div class="space-y-3">
        <div>
          <label class="input-label mb-1.5 block">已付金额</label>
          <InputNumber
            v-model="paymentAmount"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">付款日期</label>
          <Input
            v-model="paymentDate"
            type="date"
          />
        </div>
      </div>
    </ConfirmDialog>

    <!-- 对话框：完成订单 -->
    <ConfirmDialog
      :show="showCompleteDialog"
      title="完成订单"
      :message="`确定要将订单标记为已完成？`"
      confirm-text="确认完成"
      cancel-text="取消"
      :loading="completeLoading"
      loading-text="处理中..."
      @confirm="confirmComplete"
      @cancel="showCompleteDialog = false"
    >
      <TextArea
        v-model="completionReason"
        label="完结原因（可选）"
        :rows="2"
        placeholder="如非全部发货，请填写完结原因"
      />
    </ConfirmDialog>

    <!-- 对话框：取消订单 -->
    <ConfirmDialog
      :show="showCancelDialog"
      title="取消订单"
      message="确定要取消此订单？取消后相关生产、发货将受影响。"
      confirm-text="确认取消"
      cancel-text="取消"
      :danger="true"
      :loading="cancelLoading"
      loading-text="处理中..."
      @confirm="confirmCancel"
      @cancel="showCancelDialog = false"
    >
      <TextArea
        v-model="cancelReason"
        label="取消原因"
        :rows="2"
        placeholder="请输入取消原因"
      />
    </ConfirmDialog>

    <!-- 对话框：删除 -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除订单"
      message="确定要删除此订单？此操作不可恢复。"
      confirm-text="删除"
      cancel-text="取消"
      :danger="true"
      :loading="deleteLoading"
      loading-text="删除中..."
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
    <!-- 对话框：生成施工单向导 -->
    <ConfirmDialog
      :show="showConvertDialog"
      title="生成施工单"
      message=""
      confirm-text="确认生成"
      cancel-text="取消"
      :loading="converting"
      loading-text="创建中..."
      @confirm="confirmConvert"
      @cancel="showConvertDialog = false"
    >
      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          从订单 <strong>{{ detailData.order_number }}</strong> 生成施工单，系统将自动复制订单产品、工序、物料和关联资产。
        </p>
        <div>
          <label class="input-label mb-1.5 block">生产数量</label>
          <InputNumber
            v-model="convertForm.production_quantity"
            :min="1"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">交货日期</label>
          <Input
            v-model="convertForm.delivery_date"
            type="date"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">优先级</label>
          <select
            v-model="convertForm.priority"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-200"
          >
            <option value="low">
              低
            </option>
            <option value="normal">
              正常
            </option>
            <option value="high">
              高
            </option>
            <option value="urgent">
              紧急
            </option>
          </select>
        </div>
        <div>
          <label class="input-label mb-1.5 block">备注</label>
          <TextArea
            v-model="convertForm.notes"
            :rows="2"
            placeholder="请输入施工单备注"
          />
        </div>
        <div class="rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <p>提示：请确保产品已配置图稿/刀模等资产，或在施工单创建后补充。</p>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore, useApprovalConfigStore } from '@/stores'
import { ConfirmDialog, StatusTag, DescriptionGrid, DescriptionItem, SummaryTable, TextArea, Input, InputNumber, Icon, LoadingOverlay } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const approvalConfigStore = useApprovalConfigStore()
const salesorderApprovalEnabled = computed(() => approvalConfigStore.isEnabled('salesorder'))

const loading = ref(false)
const detailData = reactive<any>({})
const operationHistory = ref<any[]>([])

const showRejectDialog = ref(false)
const rejectReason = ref('')
const rejecting = ref(false)
const showPaymentDialog = ref(false)
const paymentAmount = ref(0)
const paymentDate = ref('')
const paymentLoading = ref(false)
const showCompleteDialog = ref(false)
const completionReason = ref('')
const completeLoading = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('')
const cancelLoading = ref(false)
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const showConvertDialog = ref(false)
const converting = ref(false)
const convertForm = reactive({
  production_quantity: undefined as number | undefined,
  delivery_date: '',
  priority: 'normal',
  notes: '',
})
const activeDetailTab = ref<'detail' | 'finance'>('detail')

const detailTabs: Array<{ key: 'detail' | 'finance'; label: string }> = [
  { key: 'detail', label: '订单明细' },
  { key: 'finance', label: '金额信息' },
]

const canEdit = computed(() => userStore.hasPermission('workorder.change_salesorder'))
const canConvert = computed(() => userStore.hasPermission('workorder.add_workorder'))
const canChange = computed(() => userStore.hasPermission('workorder.change_salesorder'))
const canApprove = computed(() => userStore.hasPermission('workorder.approve_salesorder'))
const canCreateDelivery = computed(() => userStore.hasPermission('workorder.add_deliveryorder'))

const loadData = async () => {
  loading.value = true
  try {
    const response: any = await salesOrderAPI.getDetail(String(route.params.id))
    Object.assign(detailData, response)
    operationHistory.value = response.history || []
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载详情失败')
  } finally {
    loading.value = false
  }
}

const getRelatedNumbers = (type: 'work_order' | 'delivery_order' | 'invoice') => {
  const summaries = detailData[`${type}_summaries`]
  if (summaries?.length > 0) return summaries.map((s: any) => s.number || s.order_number)
  const numbers = detailData[`${type}_numbers`]
  if (numbers?.length > 0) return numbers
  return []
}

const getRelatedId = (type: 'work_order' | 'delivery_order' | 'invoice', index: number) => {
  const summaries = detailData[`${type}_summaries`]
  if (summaries?.length > 0) return summaries[index]?.id
  return null
}

const hasRelatedOrders = computed(() => {
  return getRelatedNumbers('work_order').length > 0
    || getRelatedNumbers('delivery_order').length > 0
    || getRelatedNumbers('invoice').length > 0
})

const navigateToRelated = (type: string, id: number | null) => {
  if (!id) return
  if (type === 'workorder') router.push(`/workorders/${id}`)
}

const goBack = () => { router.push('/sales-orders') }
const handleEdit = () => { router.push(`/sales-orders/${route.params.id}/edit`) }

const formatAmount = (value: any) => {
  if (value === undefined || value === null || value === '') return '¥0.00'
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const handleConvert = () => {
  // 初始化表单默认值
  convertForm.production_quantity = detailData.total_quantity || undefined
  convertForm.delivery_date = detailData.delivery_date || ''
  convertForm.priority = 'normal'
  convertForm.notes = ''
  showConvertDialog.value = true
}

const confirmConvert = async () => {
  converting.value = true
  try {
    const payload: Record<string, unknown> = {}
    if (convertForm.production_quantity != null && convertForm.production_quantity > 0) {
      payload.production_quantity = convertForm.production_quantity
    }
    if (convertForm.delivery_date) {
      payload.delivery_date = convertForm.delivery_date
    }
    if (convertForm.priority) {
      payload.priority = convertForm.priority
    }
    if (convertForm.notes) {
      payload.notes = convertForm.notes
    }
    const result: any = await salesOrderAPI.convertToWorkOrder(String(route.params.id), payload)
    showConvertDialog.value = false

    // 展示自动关联的资产结果
    const autoLinked = result?.asset_link_result?.auto_linked
    if (autoLinked && Object.keys(autoLinked).length > 0) {
      const parts: string[] = []
      if (autoLinked.artworks?.length) parts.push(`图稿 ${autoLinked.artworks.length} 个`)
      if (autoLinked.dies?.length) parts.push(`刀模 ${autoLinked.dies.length} 个`)
      if (autoLinked.foiling_plates?.length) parts.push(`烫金版 ${autoLinked.foiling_plates.length} 个`)
      if (autoLinked.embossing_plates?.length) parts.push(`压凸版 ${autoLinked.embossing_plates.length} 个`)
      useUIStore().showSuccess(`施工单创建成功，已自动关联：${parts.join('、')}`)
    } else {
      useUIStore().showWarning('施工单创建成功，但未找到产品关联的已确认图稿/刀模/版类资产，请在施工单详情中补充')
    }

    if (result?.id) {
      router.push(`/workorders/${result.id}`)
    } else {
      router.push('/workorders')
    }
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建施工单失败')
  } finally {
    converting.value = false
  }
}

const handleCreateDeliveryOrder = () => {
  router.push(`/inventory/delivery/create?sales_order_id=${route.params.id}`)
}

const handleSubmitOrder = async () => {
  try { await salesOrderAPI.submit(String(route.params.id)); useUIStore().showSuccess('提交成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '提交失败') }
}

const handleApproveOrder = async () => {
  try { await salesOrderAPI.approve(String(route.params.id)); useUIStore().showSuccess('审核通过'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '审核失败') }
}

const handleRejectOrder = () => { rejectReason.value = ''; showRejectDialog.value = true }
const cancelReject = () => { showRejectDialog.value = false; rejectReason.value = '' }
const confirmReject = async () => {
  if (!rejectReason.value.trim()) { useUIStore().showWarning('请填写拒绝原因'); return }
  rejecting.value = true
  try {
    await salesOrderAPI.reject(String(route.params.id), { reason: rejectReason.value.trim() })
    useUIStore().showSuccess('已拒绝'); cancelReject(); loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') } finally { rejecting.value = false }
}

const handleUpdatePayment = () => {
  paymentAmount.value = detailData.paid_amount || 0
  paymentDate.value = ''
  showPaymentDialog.value = true
}
const confirmPayment = async () => {
  paymentLoading.value = true
  try {
    const payload: any = {}
    if (paymentAmount.value >= 0) payload.paid_amount = paymentAmount.value
    if (paymentDate.value) payload.payment_date = paymentDate.value
    await salesOrderAPI.updatePayment(String(route.params.id), payload)
    useUIStore().showSuccess('付款信息已更新'); showPaymentDialog.value = false; loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') } finally { paymentLoading.value = false }
}

const handleCompleteOrder = () => { completionReason.value = ''; showCompleteDialog.value = true }
const confirmComplete = async () => {
  completeLoading.value = true
  try {
    const payload: any = {}
    if (completionReason.value.trim()) payload.completion_reason = completionReason.value.trim()
    await salesOrderAPI.complete(String(route.params.id), payload)
    useUIStore().showSuccess('订单已完成'); showCompleteDialog.value = false; loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') } finally { completeLoading.value = false }
}

const handleCancelOrder = () => { cancelReason.value = ''; showCancelDialog.value = true }
const confirmCancel = async () => {
  cancelLoading.value = true
  try {
    const payload: any = {}
    if (cancelReason.value.trim()) payload.reason = cancelReason.value.trim()
    await salesOrderAPI.cancel(String(route.params.id), payload)
    useUIStore().showSuccess('订单已取消'); showCancelDialog.value = false; loadData()
  } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') } finally { cancelLoading.value = false }
}

const handleDeleteOrder = () => { showDeleteDialog.value = true }
const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    await salesOrderAPI.delete(String(route.params.id))
    useUIStore().showSuccess('删除成功'); showDeleteDialog.value = false; router.push('/sales-orders')
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') } finally { deleteLoading.value = false }
}

const itemColumns: Column[] = [
  { key: 'product_name', label: '产品', minWidth: 200 },
  { key: 'quantity', label: '数量', width: 80, align: 'right' },
  { key: 'unit', label: '单位', width: 80, align: 'center' },
  { key: 'unit_price', label: '单价', width: 100, align: 'right' },
  { key: 'tax_rate', label: '税率', width: 80, align: 'right' },
  { key: 'discount_amount', label: '折扣', width: 100, align: 'right' },
  { key: 'amount', label: '金额', width: 120, align: 'right' },
  { key: 'notes', label: '备注', minWidth: 120 },
]

onMounted(() => { loadData() })
</script>
