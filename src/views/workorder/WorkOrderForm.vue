<template>
  <div v-loading="pageLoading" class="workorder-form">
    <el-card class="workorder-shell">
      <div slot="header" class="form-header">
        <div class="header-copy">
          <p class="header-eyebrow">
            Production Ticket
          </p>
          <div class="header-title-row">
            <span>{{ isEdit ? '编辑施工单' : '新建施工单' }}</span>
            <el-tag size="mini" effect="plain" class="mode-tag">
              {{ isEdit ? '编辑模式' : '新建模式' }}
            </el-tag>
            <el-tag
              v-if="isApproved"
              size="mini"
              type="success"
              effect="dark"
            >
              已审核
            </el-tag>
          </div>
          <p class="header-subtitle">
            先确认客户与交期，再补充产品、工序和物料，系统会自动联动默认配置与关联资源。
          </p>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="handleCancel">
            取消
          </el-button>
          <el-button
            v-if="!isEdit"
            type="info"
            size="small"
            :loading="saving"
            @click="saveDraft"
          >
            <i class="el-icon-document"></i> 保存草稿
          </el-button>
          <el-button
            v-if="!isEdit || form.approval_status === 'rejected'"
            type="success"
            size="small"
            :loading="submitting"
            @click="submitForApproval"
          >
            <i class="el-icon-check"></i> 提交审核
          </el-button>
          <el-button
            type="primary"
            size="small"
            :loading="saving"
            @click="handleSubmit"
          >
            <i class="el-icon-check"></i> {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </div>

      <section class="form-hero">
        <div class="hero-main">
          <div class="hero-kicker">
            生产编排概览
          </div>
          <h2 class="hero-title">
            {{ selectedCustomerName || '先确认客户与交付节奏' }}
          </h2>
          <p class="hero-subtitle">
            <template v-if="form.order_date || form.delivery_date">
              <span v-if="form.order_date">下单 {{ form.order_date }}</span>
              <span
                v-if="form.order_date && form.delivery_date"
                class="hero-dot"
              ></span>
              <span v-if="form.delivery_date">计划交付 {{ form.delivery_date }}</span>
            </template>
            <template v-else>
              选择客户、交期与产品后，系统会自动补齐默认工序、物料和图稿关联。
            </template>
          </p>

          <div class="hero-chip-row">
            <div class="hero-chip">
              <span class="hero-chip-label">产品</span>
              <strong>{{ validProductCount }}</strong>
            </div>
            <div class="hero-chip">
              <span class="hero-chip-label">工序</span>
              <strong>{{ selectedProcessIds.length }}</strong>
            </div>
            <div class="hero-chip">
              <span class="hero-chip-label">物料</span>
              <strong>{{ validMaterialCount }}</strong>
            </div>
            <div class="hero-chip">
              <span class="hero-chip-label">关联资源</span>
              <strong>{{ linkedAssetCount }}</strong>
            </div>
          </div>
        </div>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-label">当前模式</span>
            <strong class="hero-stat-value">{{ isEdit ? '编辑施工单' : '创建施工单' }}</strong>
            <span class="hero-stat-meta">
              {{ isApproved ? '已审核单据，仅允许有限修改' : '可继续完善并保存或提交审核' }}
            </span>
          </div>
          <div class="hero-stat" :class="`priority-${selectedPriorityMeta.value}`">
            <span class="hero-stat-label">优先级</span>
            <strong class="hero-stat-value">{{ selectedPriorityMeta.label }}</strong>
            <span class="hero-stat-meta">按交期与生产排程决定处理顺序</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-label">生产数量</span>
            <strong class="hero-stat-value">{{ form.production_quantity || 0 }}</strong>
            <span class="hero-stat-meta">产品数量变化会联动刷新拼版数量</span>
          </div>
          <div v-if="isEdit" class="hero-stat">
            <span class="hero-stat-label">施工单号</span>
            <strong class="hero-stat-value">{{ form.order_number || '-' }}</strong>
            <span class="hero-stat-meta">单号由系统生成并作为任务追踪主键</span>
          </div>
        </div>
      </section>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="form-container workorder-form-main"
      >
        <!-- 施工单号（编辑时显示） -->
        <el-form-item v-if="isEdit" label="施工单号" class="order-number-item">
          <el-input v-model="form.order_number" disabled>
            <template slot="append">
              <span style="color: #909399;">系统自动生成</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 基本信息 -->
        <el-divider content-position="left" class="section-divider">
          基本信息
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customer">
              <el-select
                v-model="form.customer"
                placeholder="请选择客户"
                filterable
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="customer in customerList"
                  :key="customer.id"
                  :label="customer.name"
                  :value="customer.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" style="width: 100%;">
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <span :style="{color: item.color}">{{ item.label }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下单日期" prop="order_date">
              <el-date-picker
                v-model="form.order_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
                :disabled="isApproved"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交货日期" prop="delivery_date">
              <el-date-picker
                v-model="form.delivery_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
                :disabled="isApproved"
                :picker-options="deliveryDatePickerOptions"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产数量" prop="production_quantity">
              <el-input-number
                v-model="form.production_quantity"
                :min="1"
                style="width: 100%;"
                :disabled="isApproved"
                controls-position="right"
                @change="calculateProductQuantities"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预损数量">
              <el-input-number
                v-model="form.defective_quantity"
                :min="0"
                style="width: 100%;"
                :disabled="isApproved"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-if="isEdit" label="实际交货日期">
              <el-date-picker
                v-model="form.actual_delivery_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 产品信息 -->
        <el-divider content-position="left" class="section-divider">
          产品信息
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            style="margin-left: 10px;"
            :disabled="isApproved"
            @click="addProduct"
          >
            添加产品
          </el-button>
        </el-divider>

        <div v-if="form.products.length > 0" class="product-table-wrapper">
          <el-table
            :data="form.products"
            border
            style="width: 100%"
            class="editor-table"
          >
            <el-table-column label="产品名称" min-width="200">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.product"
                  placeholder="请选择产品"
                  filterable
                  style="width: 100%;"
                  :disabled="isApproved"
                  @change="handleProductChange(scope.$index, scope.row.product)"
                >
                  <el-option
                    v-for="product in productList"
                    :key="product.id"
                    :label="`${product.name} (${product.code})`"
                    :value="product.id"
                  >
                    <span style="float: left">{{ product.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ product.code }}</span>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="规格" width="150">
              <template slot-scope="scope">
                <el-input
                  :value="getProductSpecification(scope.row.product)"
                  placeholder="规格"
                  size="small"
                  disabled
                />
              </template>
            </el-table-column>
            <el-table-column label="拼版数" width="120" align="center">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.imposition_quantity"
                  :min="1"
                  :max="100"
                  size="small"
                  style="width: 100%;"
                  :disabled="isApproved"
                  controls-position="right"
                  @change="calculateProductQuantities"
                />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120" align="center">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  size="small"
                  style="width: 100%;"
                  :disabled="isApproved"
                  controls-position="right"
                  @change="calculateTotalQuantity"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  :disabled="isApproved || form.products.length <= 1"
                  @click="removeProduct(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <div class="hint-text">
            选择产品后将自动加载该产品的默认工序和物料配置
          </div>
        </div>

        <div v-else class="empty-product-hint">
          <i class="el-icon-info"></i> 暂无产品信息，请点击上方按钮添加产品
        </div>

        <!-- 图稿和刀模 -->
        <el-divider content-position="left" class="section-divider">
          图稿和刀模
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图稿（CTP版）">
              <el-select
                v-model="form.artworks"
                placeholder="请选择图稿"
                filterable
                clearable
                multiple
                style="width: 100%;"
                :disabled="isApproved"
                @change="handleArtworksChange"
              >
                <el-option
                  v-for="artwork in artworkList"
                  :key="artwork.id"
                  :label="`${artwork.code} - ${artwork.name}`"
                  :value="artwork.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="刀模">
              <el-select
                v-model="form.dies"
                placeholder="请选择刀模"
                filterable
                clearable
                multiple
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="die in dieList"
                  :key="die.id"
                  :label="`${die.code} - ${die.name}`"
                  :value="die.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="烫金版">
              <el-select
                v-model="form.foiling_plates"
                placeholder="请选择烫金版"
                filterable
                clearable
                multiple
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="plate in foilingPlateList"
                  :key="plate.id"
                  :label="`${plate.code} - ${plate.name}`"
                  :value="plate.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="击凸版">
              <el-select
                v-model="form.embossing_plates"
                placeholder="请选择击凸版"
                filterable
                clearable
                multiple
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="plate in embossingPlateList"
                  :key="plate.id"
                  :label="`${plate.code} - ${plate.name}`"
                  :value="plate.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 印刷信息 -->
        <el-divider content-position="left" class="section-divider">
          印刷信息
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="印刷形式">
              <el-select
                v-model="form.printing_type"
                placeholder="请选择印刷形式"
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="item in printingTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CMYK颜色">
              <el-checkbox-group v-model="form.printing_cmyk_colors" :disabled="isApproved">
                <el-checkbox label="C">
                  C
                </el-checkbox>
                <el-checkbox label="M">
                  M
                </el-checkbox>
                <el-checkbox label="Y">
                  Y
                </el-checkbox>
                <el-checkbox label="K">
                  K
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="其他颜色">
              <el-select
                v-model="form.printing_other_colors"
                placeholder="输入专色编号，回车添加"
                multiple
                filterable
                allow-create
                default-first-option
                style="width: 100%;"
                :disabled="isApproved"
              >
                <el-option
                  v-for="color in commonSpotColors"
                  :key="color"
                  :label="color"
                  :value="color"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 工序选择 -->
        <el-divider content-position="left" class="section-divider">
          工序选择
          <el-tag
            v-if="selectedProcessIds.length > 0"
            size="small"
            type="success"
            style="margin-left: 10px;"
          >
            已选 {{ selectedProcessIds.length }} 个工序
          </el-tag>
        </el-divider>

        <div class="process-wrapper">
          <el-checkbox-group v-model="selectedProcessIds" :disabled="isApproved" class="process-checkbox-group">
            <el-checkbox
              v-for="process in allProcesses"
              :key="process.id"
              :label="process.id"
              class="process-checkbox"
            >
              {{ process.name }}
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="allProcesses.length === 0" class="no-process-hint">
            <i class="el-icon-warning"></i> 暂无可用工序，请先在工序管理中添加工序
          </div>
        </div>

        <!-- 物料信息 -->
        <el-divider content-position="left" class="section-divider">
          物料信息
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            style="margin-left: 10px;"
            :disabled="isApproved"
            @click="addMaterialItem"
          >
            添加物料
          </el-button>
        </el-divider>

        <div v-if="form.materials.length > 0" class="material-table-wrapper">
          <el-table
            :data="form.materials"
            border
            style="width: 100%"
            class="editor-table"
          >
            <el-table-column label="物料名称" width="200">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.material"
                  placeholder="请选择物料"
                  filterable
                  style="width: 100%;"
                  :disabled="isApproved"
                >
                  <el-option
                    v-for="material in materialList"
                    :key="material.id"
                    :label="`${material.name} (${material.code})`"
                    :value="material.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="尺寸" width="150">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.material_size"
                  placeholder="如：A4、210x297mm"
                  size="small"
                  :disabled="isApproved"
                />
              </template>
            </el-table-column>
            <el-table-column label="用量" width="150">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.material_usage"
                  placeholder="如：1000张"
                  size="small"
                  :disabled="isApproved"
                />
              </template>
            </el-table-column>
            <el-table-column label="是否开料" width="100" align="center">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.need_cutting" :disabled="isApproved" />
              </template>
            </el-table-column>
            <el-table-column label="备注">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.notes"
                  placeholder="备注"
                  size="small"
                  :disabled="isApproved"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  :disabled="isApproved"
                  @click="removeMaterialItem(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else class="empty-material-hint">
          <i class="el-icon-info"></i> 暂无物料信息，选择产品后将自动加载默认物料，或点击上方按钮手动添加
        </div>

        <!-- 任务信息 -->
        <el-divider content-position="left" class="section-divider">
          任务信息
        </el-divider>

        <TaskSection
          :work-order-id="id"
          :tasks="tasks"
          :editable="!isApproved"
          :loading="tasksLoading"
        />

        <!-- 其他信息 -->
        <el-divider content-position="left" class="section-divider">
          其他信息
        </el-divider>

        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            :disabled="isApproved"
          />
        </el-form-item>

        <!-- 底部操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="handleCancel">
            取消
          </el-button>
          <el-button
            v-if="!isEdit"
            type="info"
            :loading="saving"
            @click="saveDraft"
          >
            <i class="el-icon-document"></i> 保存草稿
          </el-button>
          <el-button
            v-if="!isEdit || form.approval_status === 'rejected'"
            type="success"
            :loading="submitting"
            @click="submitForApproval"
          >
            <i class="el-icon-check"></i> 提交审核
          </el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
// 导入 API 模块
import { customerAPI } from '@/api/modules/customer'
import { productAPI } from '@/api/modules/product'
import { processAPI } from '@/api/modules/process'
import { materialAPI } from '@/api/modules/material'
import { workOrderAPI } from '@/api/modules/workorder'
import { artworkAPI } from '@/api/modules/artwork'
import { dieAPI } from '@/api/modules/die'
import { foilingPlateAPI } from '@/api/modules/foiling-plate'
import { embossingPlateAPI } from '@/api/modules/embossing-plate'
import { workOrderTaskAPI } from '@/api/modules/workorder-task'
// 导入错误处理工具和 debounce
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import { debounce } from '@/utils/debounce'
// 导入常量
import { PriorityChoices } from '@/constants'

// 导入子组件
import TaskSection from './components/TaskSection.vue'

export default {
  name: 'WorkOrderForm',
  components: {
    TaskSection
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    // 自定义验证器：交货日期必须晚于或等于下单日期
    const validateDeliveryDate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择交货日期'))
      } else if (this.form.order_date && new Date(value) < new Date(this.form.order_date)) {
        callback(new Error('交货日期不能早于下单日期'))
      } else {
        callback()
      }
    }

    return {
      // 加载状态
      pageLoading: false,
      saving: false,
      submitting: false,

      // 列表数据
      customerList: [],
      productList: [],
      materialList: [],
      artworkList: [],
      dieList: [],
      foilingPlateList: [],
      embossingPlateList: [],
      allProcesses: [],

      // 选中的工序ID列表
      selectedProcessIds: [],

      // 表单数据
      form: {
        order_number: '',
        customer: null,
        priority: 'normal',
        order_date: '',
        delivery_date: '',
        actual_delivery_date: '',
        production_quantity: 0,
        notes: '',
        approval_status: 'pending',
        // 产品列表
        products: [],
        // 图稿和刀模（多选）
        artworks: [],
        dies: [],
        foiling_plates: [],
        embossing_plates: [],
        // 印刷信息
        printing_type: 'none',
        printing_cmyk_colors: [],
        printing_other_colors: [],
        // 预损数量
        defective_quantity: null,
        // 物料列表
        materials: []
      },

      // 表单验证规则
      rules: {
        customer: [
          { required: true, message: '请选择客户', trigger: 'change' }
        ],
        order_date: [
          { required: true, message: '请选择下单日期', trigger: 'change' }
        ],
        delivery_date: [
          { required: true, validator: validateDeliveryDate, trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ]
      },

      // 优先级选项（使用常量）
      priorityOptions: PriorityChoices,

      // 印刷形式选项
      printingTypeOptions: [
        { label: '不需要印刷', value: 'none' },
        { label: '正面印刷', value: 'front' },
        { label: '背面印刷', value: 'back' },
        { label: '自反印刷', value: 'self_reverse' },
        { label: '反咬口印刷', value: 'reverse_gripper' },
        { label: '套版印刷', value: 'register' }
      ],

      // 常用专色列表
      commonSpotColors: [
        '528C', '485C', '186C', '032C', '021C',
        '金色', '银色', '珠光', '荧光绿', '荧光橙'
      ],

      // 任务相关数据
      tasks: [],
      tasksLoading: false,

      // 防抖保存草稿函数
      debouncedSaveDraft: null
    }
  },
  computed: {
    isEdit() {
      return !!this.id
    },
    isApproved() {
      return this.form.approval_status === 'approved'
    },
    selectedCustomerName() {
      const customer = this.customerList.find(item => item.id === this.form.customer)
      return customer ? customer.name : ''
    },
    selectedPriorityMeta() {
      return this.priorityOptions.find(item => item.value === this.form.priority) || this.priorityOptions[1]
    },
    validProductCount() {
      return this.form.products.filter(item => item.product).length
    },
    validMaterialCount() {
      return this.form.materials.filter(item => item.material).length
    },
    linkedAssetCount() {
      return (
        (this.form.artworks || []).length +
        (this.form.dies || []).length +
        (this.form.foiling_plates || []).length +
        (this.form.embossing_plates || []).length
      )
    },
    // 交货日期选择器选项
    deliveryDatePickerOptions() {
      const orderDate = this.form.order_date
      return {
        disabledDate: (date) => {
          if (!orderDate) return false
          return date < new Date(orderDate)
        }
      }
    }
  },
  watch: {
    // 监听表单变化，防抖保存草稿
    form: {
      handler() {
        if (!this.isEdit && this.debouncedSaveDraft) {
          this.debouncedSaveDraft()
        }
      },
      deep: true
    },
    // 监听下单日期变化
    'form.order_date'() {
      if (this.form.delivery_date) {
        this.$refs.form?.validateField('delivery_date')
      }
    }
  },
  created() {
    // 初始化防抖函数
    this.debouncedSaveDraft = debounce(() => {
      this.saveDraftToLocalStorage()
    }, 2000)
  },
  async mounted() {
    await this.loadAllData()
    if (this.isEdit) {
      await this.loadWorkOrder()
    } else {
      this.initNewForm()
      this.restoreDraftFromLocalStorage()
    }
  },
  beforeDestroy() {
    if (this.debouncedSaveDraft) {
      this.debouncedSaveDraft.cancel()
    }
  },
  methods: {
    // ==================== 数据加载 ====================

    async loadAllData() {
      this.pageLoading = true
      try {
        const [
          customersRes,
          productsRes,
          materialsRes,
          artworksRes,
          diesRes,
          foilingPlatesRes,
          embossingPlatesRes,
          processesRes
        ] = await Promise.all([
          customerAPI.getList({ page_size: 1000 }),
          productAPI.getList({ is_active: true, page_size: 1000 }),
          materialAPI.getList({ page_size: 1000 }),
          artworkAPI.getList({ page_size: 1000 }),
          dieAPI.getList({ page_size: 1000 }),
          foilingPlateAPI.getList({ page_size: 1000 }),
          embossingPlateAPI.getList({ page_size: 1000 }),
          processAPI.getList({ is_active: true, page_size: 1000, ordering: 'sort_order' })
        ])

        this.customerList = customersRes.results || customersRes || []
        this.productList = productsRes.results || productsRes || []
        this.materialList = materialsRes.results || materialsRes || []
        this.artworkList = artworksRes.results || artworksRes || []
        this.dieList = diesRes.results || diesRes || []
        this.foilingPlateList = foilingPlatesRes.results || foilingPlatesRes || []
        this.embossingPlateList = embossingPlatesRes.results || embossingPlatesRes || []
        this.allProcesses = processesRes.results || processesRes || []
      } catch (error) {
        ErrorHandler.showMessage(error, '加载数据')
      } finally {
        this.pageLoading = false
      }
    },

    async loadWorkOrder() {
      this.pageLoading = true
      try {
        const response = await workOrderAPI.getDetail(this.id)
        const data = response.data || response

        // 填充基本信息
        this.form = {
          ...this.form,
          order_number: data.order_number,
          customer: data.customer,
          priority: data.priority,
          order_date: data.order_date,
          delivery_date: data.delivery_date,
          actual_delivery_date: data.actual_delivery_date || '',
          production_quantity: data.production_quantity || 0,
          defective_quantity: data.defective_quantity || null,
          notes: data.notes || '',
          approval_status: data.approval_status || 'pending',
          // 图稿和刀模（多选）
          artworks: data.artworks || [],
          dies: data.dies || [],
          foiling_plates: data.foiling_plates || [],
          embossing_plates: data.embossing_plates || [],
          // 印刷信息
          printing_type: data.printing_type || 'none',
          printing_cmyk_colors: data.printing_cmyk_colors || [],
          printing_other_colors: data.printing_other_colors || []
        }

        // 填充产品列表
        if (data.products && data.products.length > 0) {
          this.form.products = data.products.map(p => ({
            product: p.product || p.id,
            quantity: p.quantity || 1,
            imposition_quantity: p.imposition_quantity || 1,
            unit: p.unit || '件'
          }))
        } else {
          this.form.products = []
        }

        // 填充物料列表
        if (data.materials && data.materials.length > 0) {
          this.form.materials = data.materials.map(m => ({
            id: m.id,
            material: m.material,
            material_size: m.material_size || '',
            material_usage: m.material_usage || '',
            need_cutting: m.need_cutting || false,
            notes: m.notes || ''
          }))
        }

        // 填充已选工序（直接使用工序ID数组）
        if (data.processes && data.processes.length > 0) {
          this.selectedProcessIds = [...data.processes]
        }

        // 加载关联任务
        await this.loadTasks()
      } catch (error) {
        ErrorHandler.showMessage(error, '加载施工单')
      } finally {
        this.pageLoading = false
      }
    },

    async loadTasks() {
      if (!this.id) return

      this.tasksLoading = true
      try {
        const response = await workOrderTaskAPI.getList({
          work_order: this.id,
          page_size: 1000
        })
        this.tasks = response.results || response || []
      } catch (error) {
        // 加载任务失败时静默处理
        logger.warn('加载任务失败', error)
        this.tasks = []
      } finally {
        this.tasksLoading = false
      }
    },

    initNewForm() {
      // 设置默认日期
      const today = new Date()
      this.form.order_date = this.formatDate(today)

      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 7)
      this.form.delivery_date = this.formatDate(deliveryDate)

      // 添加一个空产品项
      this.form.products = [{
        product: null,
        quantity: 1,
        imposition_quantity: 1,
        unit: '件'
      }]
    },

    // ==================== 产品相关 ====================

    addProduct() {
      this.form.products.push({
        product: null,
        quantity: 1,
        imposition_quantity: 1,
        unit: '件'
      })
    },

    removeProduct(index) {
      if (this.form.products.length > 1) {
        this.form.products.splice(index, 1)
        this.calculateTotalQuantity()
      }
    },

    getProductSpecification(productId) {
      if (!productId) return ''
      const product = this.productList.find(p => p.id === productId)
      return product ? product.specification : ''
    },

    async handleProductChange(index, productId) {
      if (!productId) return

      try {
        // 获取产品详情（包含默认工序和物料）
        const response = await productAPI.getDetail(productId)
        const productDetail = response.data || response

        // 自动加载默认工序
        if (productDetail.default_processes && productDetail.default_processes.length > 0) {
          let addedCount = 0
          productDetail.default_processes.forEach(processId => {
            // 避免重复添加
            if (!this.selectedProcessIds.includes(processId)) {
              this.selectedProcessIds.push(processId)
              addedCount++
            }
          })
          if (addedCount > 0) {
            this.$message.success(`已自动加载 ${addedCount} 个默认工序`)
          }
        }

        // 自动加载默认物料（如果产品有关联物料）
        if (productDetail.default_materials && productDetail.default_materials.length > 0) {
          let addedCount = 0
          productDetail.default_materials.forEach(m => {
            // 避免重复添加
            const exists = this.form.materials.some(fm => fm.material === m.material)
            if (!exists) {
              this.form.materials.push({
                material: m.material,
                material_size: m.material_size || '',
                material_usage: m.material_usage || '',
                need_cutting: m.need_cutting || false,
                notes: ''
              })
              addedCount++
            }
          })
          if (addedCount > 0) {
            this.$message.success(`已自动加载 ${addedCount} 个默认物料`)
          }
        }

        this.calculateTotalQuantity()
      } catch (error) {
        // 加载产品默认信息失败时静默处理，不影响用户操作
        logger.warn('加载产品默认信息失败', error)
      }
    },

    calculateTotalQuantity() {
      this.form.production_quantity = this.form.products.reduce(
        (sum, p) => sum + (p.quantity || 0),
        0
      )
    },

    calculateProductQuantities() {
      // 根据生产数量和拼版数计算每个产品的数量
      // 公式：产品数量 = 生产数量 * 拼版数
      const productionQty = this.form.production_quantity || 0
      this.form.products.forEach(p => {
        const impositionQty = p.imposition_quantity || 1
        p.quantity = productionQty * impositionQty
      })
    },

    // ==================== 图稿相关 ====================

    async handleArtworksChange(artworkIds) {
      if (!artworkIds || artworkIds.length === 0) return

      try {
        // 获取所有选中图稿的详情
        for (const artworkId of artworkIds) {
          const artwork = this.artworkList.find(a => a.id === artworkId)
          if (!artwork) continue

          // 如果图稿有 CMYK 颜色，自动填充（合并不重复）
          if (artwork.cmyk_colors && artwork.cmyk_colors.length > 0) {
            artwork.cmyk_colors.forEach(color => {
              if (!this.form.printing_cmyk_colors.includes(color)) {
                this.form.printing_cmyk_colors.push(color)
              }
            })
          }

          // 如果图稿有其他颜色，自动填充（合并不重复）
          if (artwork.other_colors && artwork.other_colors.length > 0) {
            artwork.other_colors.forEach(color => {
              if (!this.form.printing_other_colors.includes(color)) {
                this.form.printing_other_colors.push(color)
              }
            })
          }

          // 如果图稿有关联刀模，自动填充（合并不重复）
          if (artwork.dies && artwork.dies.length > 0) {
            artwork.dies.forEach(dieId => {
              if (!this.form.dies.includes(dieId)) {
                this.form.dies.push(dieId)
              }
            })
          }

          // 如果图稿有关联烫金版，自动填充（合并不重复）
          if (artwork.foiling_plates && artwork.foiling_plates.length > 0) {
            artwork.foiling_plates.forEach(plateId => {
              if (!this.form.foiling_plates.includes(plateId)) {
                this.form.foiling_plates.push(plateId)
              }
            })
          }

          // 如果图稿有关联压凸版，自动填充（合并不重复）
          if (artwork.embossing_plates && artwork.embossing_plates.length > 0) {
            artwork.embossing_plates.forEach(plateId => {
              if (!this.form.embossing_plates.includes(plateId)) {
                this.form.embossing_plates.push(plateId)
              }
            })
          }
        }

        // 如果选择了图稿且印刷形式为"不需要印刷"，自动改为"正面印刷"
        if (this.form.printing_type === 'none' && artworkIds.length > 0) {
          this.form.printing_type = 'front'
        }

        this.$message.success('已自动加载图稿关联信息')
      } catch (error) {
        // 加载图稿信息失败时静默处理
        logger.warn('加载图稿信息失败', error)
      }
    },

    // ==================== 物料相关 ====================

    addMaterialItem() {
      this.form.materials.push({
        material: null,
        material_size: '',
        material_usage: '',
        need_cutting: false,
        notes: ''
      })
    },

    removeMaterialItem(index) {
      this.form.materials.splice(index, 1)
    },

    // ==================== 草稿管理 ====================

    saveDraftToLocalStorage() {
      try {
        const draft = {
          form: this.form,
          selectedProcessIds: this.selectedProcessIds,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('workorder_draft', JSON.stringify(draft))
      } catch (error) {
        // 保存草稿失败时静默处理
        logger.warn('保存草稿失败', error)
      }
    },

    restoreDraftFromLocalStorage() {
      // 只在新建模式下恢复草稿，编辑模式不恢复
      if (this.isEdit) return

      try {
        const draftStr = localStorage.getItem('workorder_draft')
        if (!draftStr) return

        const draft = JSON.parse(draftStr)
        const draftTime = new Date(draft.timestamp)
        const hoursDiff = (new Date() - draftTime) / (1000 * 60 * 60)

        if (hoursDiff > 24) {
          localStorage.removeItem('workorder_draft')
          return
        }

        // 恢复数据
        if (draft.form) {
          this.form = { ...this.form, ...draft.form }
        }
        if (draft.selectedProcessIds) {
          this.selectedProcessIds = [...draft.selectedProcessIds]
        }

        this.$message.info('已恢复上次的草稿数据')
      } catch (error) {
        // 恢复草稿失败时静默处理并清除损坏的草稿
        logger.warn('恢复草稿失败', error)
        localStorage.removeItem('workorder_draft')
      }
    },

    clearDraftFromLocalStorage() {
      localStorage.removeItem('workorder_draft')
    },

    // ==================== 表单验证 ====================

    async validateForm() {
      // 验证基础表单
      try {
        await this.$refs.form.validate()
      } catch {
        ErrorHandler.showWarning('请完善基本信息')
        return false
      }

      // 验证产品
      const validProducts = this.form.products.filter(p => p.product && p.quantity > 0)
      if (validProducts.length === 0) {
        ErrorHandler.showWarning('请添加至少一个产品')
        return false
      }

      // 验证工序
      if (this.selectedProcessIds.length === 0) {
        ErrorHandler.showWarning('请选择至少一个工序')
        return false
      }

      return true
    },

    // ==================== 数据准备 ====================

    prepareSubmitData(options = {}) {
      const validProducts = this.form.products.filter(p => p.product && p.quantity > 0)
      const validMaterials = this.form.materials.filter(m => m.material)

      return {
        customer: this.form.customer,
        priority: this.form.priority,
        order_date: this.form.order_date,
        delivery_date: this.form.delivery_date,
        actual_delivery_date: this.form.actual_delivery_date || null,
        production_quantity: this.form.production_quantity,
        defective_quantity: this.form.defective_quantity || null,
        notes: this.form.notes || '',
        // 图稿和刀模（多选）
        artworks: this.form.artworks || [],
        dies: this.form.dies || [],
        foiling_plates: this.form.foiling_plates || [],
        embossing_plates: this.form.embossing_plates || [],
        // 印刷信息
        printing_type: this.form.printing_type || 'none',
        printing_cmyk_colors: this.form.printing_cmyk_colors || [],
        printing_other_colors: this.form.printing_other_colors || [],
        // 状态覆盖
        ...(options.status && { status: options.status }),
        ...(options.approval_status && { approval_status: options.approval_status }),
        // 产品数据
        products_data: validProducts.map((p, index) => ({
          product: p.product,
          quantity: p.quantity,
          imposition_quantity: p.imposition_quantity || 1,
          unit: p.unit || '件',
          sort_order: index
        })),
        // 工序数据
        processes: [...this.selectedProcessIds],
        // 物料数据
        materials_data: validMaterials.map(m => ({
          material: m.material,
          material_size: m.material_size || '',
          material_usage: m.material_usage || '',
          need_cutting: m.need_cutting || false,
          notes: m.notes || '',
          purchase_status: m.purchase_status || 'pending'
        }))
      }
    },

    // ==================== 保存操作 ====================

    async saveDraft() {
      this.saving = true
      try {
        const data = this.prepareSubmitData({ status: 'draft' })
        if (this.isEdit) {
          await workOrderAPI.update(this.id, data)
        } else {
          await workOrderAPI.create(data)
        }
        ErrorHandler.showSuccess('草稿保存成功')
        this.clearDraftFromLocalStorage()
      } catch (error) {
        ErrorHandler.showMessage(error, '保存草稿')
      } finally {
        this.saving = false
      }
    },

    async submitForApproval() {
      const isValid = await this.validateForm()
      if (!isValid) return

      this.submitting = true
      try {
        const data = this.prepareSubmitData({ approval_status: 'pending' })
        if (this.isEdit) {
          await workOrderAPI.update(this.id, data)
        } else {
          await workOrderAPI.create(data)
        }
        ErrorHandler.showSuccess('提交审核成功')
        this.clearDraftFromLocalStorage()
        this.$router.push('/workorders')
      } catch (error) {
        ErrorHandler.showMessage(error, '提交审核')
      } finally {
        this.submitting = false
      }
    },

    async handleSubmit() {
      const isValid = await this.validateForm()
      if (!isValid) return

      this.saving = true
      try {
        const data = this.prepareSubmitData()
        if (this.isEdit) {
          await workOrderAPI.update(this.id, data)
          ErrorHandler.showSuccess('施工单更新成功')
        } else {
          await workOrderAPI.create(data)
          ErrorHandler.showSuccess('施工单创建成功')
        }
        this.clearDraftFromLocalStorage()
        this.$router.push('/workorders')
      } catch (error) {
        ErrorHandler.showMessage(error, '保存施工单')
      } finally {
        this.saving = false
      }
    },

    handleCancel() {
      this.$router.back()
    },

    // ==================== 工具方法 ====================

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.workorder-form {
  --page-bg: #eef6f4;
  --panel-bg: #fcfffd;
  --panel-elevated: #f6fbf9;
  --line-soft: rgba(41, 108, 95, 0.12);
  --line-strong: rgba(32, 122, 102, 0.22);
  --ink-strong: #173a33;
  --ink: #2e5a52;
  --ink-soft: #6a877f;
  --accent: #22a486;
  --accent-deep: #177961;
  --accent-wash: rgba(34, 164, 134, 0.12);
  --shadow-soft: 0 22px 52px rgba(26, 94, 79, 0.08);
  --shadow-strong: 0 28px 70px rgba(20, 87, 74, 0.12);
  padding: clamp(16px, 2.2vw, 28px);
  background:
    radial-gradient(circle at top left, rgba(57, 177, 151, 0.12), transparent 34%),
    linear-gradient(180deg, #edf6f3 0%, #f7fbfa 100%);
}

.workorder-shell {
  border: 1px solid var(--line-soft);
  border-radius: 30px;
  overflow: hidden;
  background: var(--panel-bg);
  box-shadow: var(--shadow-soft);
}

.workorder-shell::before {
  content: '';
  display: block;
  height: 6px;
  background: linear-gradient(90deg, #1b8d74 0%, #53c8af 58%, #a6e6d9 100%);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 8px 8px 0;
}

.header-copy {
  min-width: 0;
}

.header-eyebrow {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-deep);
}

.header-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.form-header span {
  font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 700;
  line-height: 1.08;
  color: var(--ink-strong);
}

.mode-tag {
  border-color: rgba(34, 164, 134, 0.2);
  color: var(--accent-deep);
  background: rgba(34, 164, 134, 0.1);
}

.header-subtitle {
  max-width: 720px;
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-soft);
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.header-actions ::v-deep .el-button {
  min-width: 112px;
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border-color: rgba(27, 121, 97, 0.14);
  color: var(--ink);
  background: #fff;
  box-shadow: 0 12px 24px rgba(28, 87, 74, 0.06);
}

.header-actions ::v-deep .el-button--primary,
.header-actions ::v-deep .el-button--success {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent-deep) 0%, var(--accent) 100%);
}

.header-actions ::v-deep .el-button--info {
  color: var(--accent-deep);
  border-color: rgba(34, 164, 134, 0.18);
  background: rgba(34, 164, 134, 0.09);
}

.form-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
  gap: 22px;
  margin: 0 22px;
  padding: 24px 28px 28px;
  border: 1px solid var(--line-soft);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(26, 142, 115, 0.12), rgba(26, 142, 115, 0.02)),
    linear-gradient(180deg, #fbfefd 0%, #f4fbf8 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.hero-main {
  min-width: 0;
}

.hero-kicker {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--accent-deep);
}

.hero-title {
  margin: 0;
  font-size: clamp(28px, 3.6vw, 44px);
  line-height: 1.04;
  color: var(--ink-strong);
}

.hero-subtitle {
  margin: 14px 0 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
}

.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(23, 121, 97, 0.35);
}

.hero-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.hero-chip {
  min-width: 104px;
  padding: 12px 14px;
  border: 1px solid rgba(23, 121, 97, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 10px 20px rgba(21, 90, 76, 0.05);
}

.hero-chip-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
}

.hero-chip strong {
  font-size: 22px;
  line-height: 1;
  color: var(--ink-strong);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat {
  min-height: 128px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(27, 121, 97, 0.12);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12px 26px rgba(19, 82, 70, 0.05);
}

.hero-stat.priority-low {
  background: linear-gradient(180deg, rgba(103, 194, 58, 0.12), rgba(255, 255, 255, 0.88));
}

.hero-stat.priority-normal {
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.11), rgba(255, 255, 255, 0.88));
}

.hero-stat.priority-high {
  background: linear-gradient(180deg, rgba(230, 162, 60, 0.14), rgba(255, 255, 255, 0.88));
}

.hero-stat.priority-urgent {
  background: linear-gradient(180deg, rgba(245, 108, 108, 0.14), rgba(255, 255, 255, 0.88));
}

.hero-stat-label {
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
}

.hero-stat-value {
  margin: 10px 0 8px;
  font-size: 22px;
  line-height: 1.2;
  color: var(--ink-strong);
}

.hero-stat-meta {
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-soft);
}

.form-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 34px 38px;
}

.workorder-form-main ::v-deep .el-form-item {
  margin-bottom: 22px;
}

.workorder-form-main ::v-deep .el-form-item__label {
  font-weight: 600;
  color: var(--ink);
}

.workorder-form-main ::v-deep .el-input__inner,
.workorder-form-main ::v-deep .el-textarea__inner,
.workorder-form-main ::v-deep .el-input-number__decrease,
.workorder-form-main ::v-deep .el-input-number__increase {
  border-radius: 16px;
  border-color: var(--line-soft);
}

.workorder-form-main ::v-deep .el-input__inner,
.workorder-form-main ::v-deep .el-textarea__inner {
  min-height: 48px;
  color: var(--ink-strong);
  background: linear-gradient(180deg, #ffffff 0%, #fbfefd 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.workorder-form-main ::v-deep .el-textarea__inner {
  min-height: 118px;
  padding-top: 14px;
}

.workorder-form-main ::v-deep .el-input__inner:focus,
.workorder-form-main ::v-deep .el-textarea__inner:focus {
  border-color: rgba(34, 164, 134, 0.55);
  box-shadow: 0 0 0 4px rgba(34, 164, 134, 0.12);
}

.workorder-form-main ::v-deep .el-input-number {
  width: 100%;
}

.workorder-form-main ::v-deep .el-input-group__append {
  border-radius: 0 16px 16px 0;
  border-color: var(--line-soft);
  background: rgba(34, 164, 134, 0.08);
  color: var(--ink-soft);
}

.order-number-item {
  padding: 18px 20px 2px;
  border: 1px dashed rgba(34, 164, 134, 0.24);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(34, 164, 134, 0.06), rgba(255, 255, 255, 0.5));
}

.product-table-wrapper {
  margin-bottom: 24px;
}

.process-wrapper,
.product-table-wrapper,
.material-table-wrapper {
  padding: 18px 20px 22px;
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  background: linear-gradient(180deg, var(--panel-elevated) 0%, #ffffff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.hint-text {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-soft);
}

.process-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.process-checkbox {
  width: 100%;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.process-checkbox.is-checked {
  transform: translateY(-1px);
  border-color: rgba(34, 164, 134, 0.34);
  background: rgba(34, 164, 134, 0.09);
  box-shadow: 0 12px 20px rgba(24, 102, 84, 0.08);
}

.process-checkbox ::v-deep .el-checkbox__label {
  padding-left: 10px;
  color: var(--ink);
  white-space: normal;
  line-height: 1.45;
}

.process-checkbox.is-checked ::v-deep .el-checkbox__label {
  color: var(--ink-strong);
}

.no-process-hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-soft);
}

.empty-product-hint,
.empty-material-hint {
  margin-bottom: 24px;
  padding: 28px 24px;
  text-align: center;
  color: var(--ink-soft);
  border-radius: 24px;
  border: 1px dashed rgba(34, 164, 134, 0.24);
  background:
    radial-gradient(circle at top, rgba(34, 164, 134, 0.12), transparent 55%),
    linear-gradient(180deg, #f6fbf9 0%, #ffffff 100%);
}

.editor-table ::v-deep .el-table__header-wrapper th {
  border-bottom-color: rgba(27, 121, 97, 0.12);
  background: rgba(34, 164, 134, 0.08);
  color: var(--ink);
}

.editor-table ::v-deep .el-table,
.editor-table ::v-deep .el-table__expanded-cell {
  color: var(--ink);
  background: transparent;
}

.editor-table ::v-deep .el-table td,
.editor-table ::v-deep .el-table th.is-leaf {
  border-bottom-color: rgba(27, 121, 97, 0.1);
}

.editor-table ::v-deep .el-table::before {
  display: none;
}

.form-actions {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid rgba(27, 121, 97, 0.12);
  text-align: left;
}

.form-actions ::v-deep .el-button {
  min-width: 116px;
  height: 42px;
  border-radius: 999px;
}

.form-actions ::v-deep .el-button + .el-button {
  margin-left: 10px;
}

.section-divider {
  margin: 34px 0 18px;
}

.section-divider ::v-deep .el-divider__text {
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(34, 164, 134, 0.18);
  background: #f8fcfb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-deep);
  box-shadow: 0 8px 18px rgba(17, 92, 77, 0.04);
}

@media (max-width: 768px) {
  .workorder-form {
    padding: 10px;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding: 4px 0 0;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .header-actions ::v-deep .el-button {
    flex: 1 1 150px;
  }

  .form-hero {
    grid-template-columns: 1fr;
    margin: 0 12px;
    padding: 20px;
    border-radius: 24px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .form-container {
    padding: 22px 14px 30px;
  }

  .process-wrapper,
  .product-table-wrapper,
  .material-table-wrapper {
    padding: 14px;
  }

  .form-actions {
    text-align: left;
  }

  .form-actions ::v-deep .el-button {
    width: 100%;
    margin-left: 0 !important;
    margin-bottom: 10px;
  }
}
</style>
