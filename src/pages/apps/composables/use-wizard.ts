import { toast } from 'vue-sonner'

import {
  useFlowCompletionMutation,
  useGetImageGenerationResultQuery,
  useGetSkillDetailQuery,
} from '@/services/api/skill.api'
import { useUserInfoStore } from '@/stores/user-info'

import type { IChoiceOption, ISkillFlow, IStepConfig, IStepField, IWizardStepForm, IWizardSubmitForm } from '../types/wizard.types'

import { useSkillFlowDataByBuiltin } from './use-skill-flow-data'

/** 解析字段数据源配置 */
export function parseFieldDataSource(field: IStepField): {
  isDynamic: boolean
  builtin: string | null
  staticOptions: IChoiceOption[]
} {
  const dsConfig = field.dataSourceConfig

  // 静态数据（数组）
  if (Array.isArray(dsConfig)) {
    return { isDynamic: false, builtin: null, staticOptions: dsConfig }
  }

  // 内置数据源（对象）
  if (dsConfig && typeof dsConfig === 'object' && 'builtin' in dsConfig) {
    return { isDynamic: true, builtin: dsConfig.builtin, staticOptions: [] }
  }

  return { isDynamic: false, builtin: null, staticOptions: [] }
}

/** 解析步骤配置（新结构：直接是对象，含 fields 数组） */
export function parseStepConfig(
  stepConfig: IStepConfig | null,
  dynamicDataMap?: Record<string, IChoiceOption[]>,
): {
  layout: string
  title: string
  fields: Array<{
    field: string
    label: string
    layout: string
    options: IChoiceOption[]
    required: boolean
    isDynamic: boolean
  }>
} | null {
  if (!stepConfig)
    return null

  // 无数据步骤（fields 可能为 null 或空数组）
  if (stepConfig.layout === 'none' || !stepConfig.fields || stepConfig.fields.length === 0)
    return { layout: 'none', title: stepConfig.title || '', fields: [] }

  const fields = stepConfig.fields.map((f) => {
    const { isDynamic, builtin, staticOptions } = parseFieldDataSource(f)

    // 如果是动态数据源，尝试从 dynamicDataMap 获取
    let options = staticOptions
    if (isDynamic && builtin && dynamicDataMap?.[builtin]) {
      options = dynamicDataMap[builtin]
    }

    return {
      field: f.field,
      label: f.label,
      layout: f.layout || 'list',
      options,
      required: f.required,
      isDynamic,
    }
  })

  return {
    layout: stepConfig.layout,
    title: stepConfig.title || '',
    fields,
  }
}

/** 解析分支规则 */
export function parseBranchRule(ruleStr: string | null): { field: string, conditions: { value: string, nextStep: string }[] } | null {
  if (!ruleStr)
    return null
  try {
    return JSON.parse(ruleStr)
  }
  catch {
    return null
  }
}

/** 获取下一步编码 */
export function getNextStepCode(
  currentFlow: ISkillFlow,
  userChoices: Record<string, any>,
): string | null {
  // 先检查分支规则
  const branchRule = parseBranchRule(currentFlow.branchRule)
  if (branchRule) {
    const userValue = userChoices[branchRule.field]
    const condition = branchRule.conditions.find(c => c.value === userValue)
    if (condition) {
      return condition.nextStep
    }
  }

  // 默认下一步
  return currentFlow.nextStepCode
}

/** 创建向导状态管理 */
export function useWizard(skillId: Ref<string>) {
  // 技能详情
  const { data: skillDetailData, isLoading: isDetailLoading } = useGetSkillDetailQuery(skillId)
  const skillDetail = computed(() => skillDetailData.value?.data ?? null)

  // 流程节点列表
  const flows = computed(() => skillDetail.value?.flows ?? [])

  // 当前步骤
  const currentStepIndex = ref(0)
  const currentStepCode = ref('')
  const completedStepCodes = ref<string[]>([])

  // 用户选择数据
  const userChoices = ref<Record<string, any>>({})

  // 步骤表单数据（用于提交给后端生成 prompt）
  const stepForms = ref<IWizardStepForm[]>([])

  // AI 生成状态
  const chatId = ref<string | null>(null)
  const isGenerating = ref(false)
  const generationId = ref<string | null>(null)
  const generatedImageUrl = ref<string | null>(null)
  const generationStatus = ref<0 | 1 | 2 | null>(null)
  const generationError = ref<string | null>(null)

  // AI 生成内容
  const aiContent = ref('')
  const isProcessing = ref(false)

  // 当前流程节点
  const currentFlow = computed<ISkillFlow | null>(() => {
    if (!currentStepCode.value || flows.value.length === 0)
      return null
    return flows.value.find(f => f.stepCode === currentStepCode.value) ?? null
  })

  // 初始化：技能详情加载完成后定位到第一步
  watch(skillDetail, (detail) => {
    if (detail && detail.flows.length > 0) {
      const firstFlow = detail.flows[0]
      currentStepCode.value = firstFlow.stepCode
      currentStepIndex.value = 0
    }
  })

  // 步骤总数
  const totalSteps = computed(() => flows.value.length)

  // 进度百分比
  const progressPercent = computed(() => {
    if (totalSteps.value === 0)
      return 0
    return Math.round((completedStepCodes.value.length / totalSteps.value) * 100)
  })

  // 动态数据源状态
  const dynamicDataMap = ref<Record<string, IChoiceOption[]>>({})

  // 设置动态数据
  function setDynamicData(builtin: string, options: IChoiceOption[]) {
    dynamicDataMap.value = { ...dynamicDataMap.value, [builtin]: options }
  }

  // 站长模式下传入的商户编码
  const stationMerchantCode = ref<string | undefined>(undefined)

  // 当前使用的商户编码（站长模式下传入商户的 merchantCode，商户模式下从 userInfoStore 获取）
  const userInfoStore = useUserInfoStore()
  const currentMerchantCode = computed(() => {
    // 优先使用站长模式传入的商户编码
    if (stationMerchantCode.value)
      return stationMerchantCode.value
    // 否则使用当前登录商户的编码
    return userInfoStore.merchantInfo?.merchantCode
  })

  // 预定义所有可能的 builtin 查询（在 setup 顶层创建，避免在 watch/computed 中调用 composable）
  const builtinGoods = ref<string | null>(null)
  const builtinPromo = ref<string | null>(null)
  const queryGoods = useSkillFlowDataByBuiltin(builtinGoods, currentMerchantCode)
  const queryPromo = useSkillFlowDataByBuiltin(builtinPromo, currentMerchantCode)

  // 当 flows 加载完成后，激活对应的 builtin 查询
  watch(flows, (newFlows) => {
    if (!newFlows || newFlows.length === 0)
      return

    // 收集所有 builtin 标识
    const builtins = new Set<string>()
    newFlows.forEach((flow) => {
      if (!flow.stepConfig || !flow.stepConfig.fields)
        return
      flow.stepConfig.fields.forEach((f) => {
        if (f.dataSourceType === 4 && f.dataSourceConfig && !Array.isArray(f.dataSourceConfig)) {
          const builtin = (f.dataSourceConfig as { builtin: string }).builtin
          if (builtin)
            builtins.add(builtin)
        }
      })
    })

    // 激活对应的查询
    builtins.forEach((builtin) => {
      if (builtin === 'merchant_goods' && !builtinGoods.value) {
        builtinGoods.value = 'merchant_goods'
      }
      else if (builtin === 'merchant_promo_rules' && !builtinPromo.value) {
        builtinPromo.value = 'merchant_promo_rules'
      }
    })
  }, { immediate: true })

  // 当查询数据返回后，自动传入 dynamicDataMap
  watch(() => queryGoods.options.value, (options) => {
    if (options.length > 0 && !dynamicDataMap.value.merchant_goods) {
      setDynamicData('merchant_goods', options)
    }
  }, { immediate: true })

  watch(() => queryPromo.options.value, (options) => {
    if (options.length > 0 && !dynamicDataMap.value.merchant_promo_rules) {
      setDynamicData('merchant_promo_rules', options)
    }
  }, { immediate: true })

  // 当前步骤的解析后配置（传入 dynamicDataMap）
  const currentStepConfig = computed(() => {
    if (!currentFlow.value)
      return null
    return parseStepConfig(currentFlow.value.stepConfig, dynamicDataMap.value)
  })

  // 当前步骤是否已选择（用于控制下一步按钮）
  const isCurrentStepValid = computed(() => {
    if (!currentFlow.value)
      return false
    if (currentFlow.value.isRequired === 0)
      return true

    const stepConfig = currentStepConfig.value
    if (!stepConfig || stepConfig.fields.length === 0)
      return true

    // 检查所有必填字段是否都已选择
    return stepConfig.fields.every((f) => {
      if (!f.required)
        return true
      return userChoices.value[f.field] !== undefined
    })
  })

  // 做出选择（同时记录完整选项信息到 stepForms）
  function makeChoice(field: string, value: string, option?: IChoiceOption) {
    // 更新简化的用户选择
    userChoices.value = { ...userChoices.value, [field]: value }

    // 更新步骤表单数据
    const currentStep = stepForms.value.find(s => s.stepCode === currentStepCode.value)
    if (currentStep) {
      const fieldValue = currentStep.fieldValues.find(fv => fv.field === field)
      if (fieldValue) {
        fieldValue.value = value
        if (option) {
          fieldValue.selectedOptions = [option]
        }
      }
      else {
        // 从 currentStepConfig 获取 label
        const config = currentStepConfig.value
        const fieldConfig = config?.fields.find(f => f.field === field)
        currentStep.fieldValues.push({
          field,
          label: fieldConfig?.label || field,
          value,
          selectedOptions: option ? [option] : [],
        })
      }
    }
  }

  // 初始化/更新当前步骤的表单结构
  function initStepForm(flow: ISkillFlow) {
    const existing = stepForms.value.find(s => s.stepCode === flow.stepCode)
    if (existing)
      return

    const stepForm: IWizardStepForm = {
      flowId: String(flow.flowId),
      stepCode: flow.stepCode,
      stepName: flow.stepName,
      fieldValues: [],
    }

    // 从 stepConfig 预填充字段结构
    const config = parseStepConfig(flow.stepConfig, dynamicDataMap.value)
    if (config) {
      config.fields.forEach((f) => {
        stepForm.fieldValues.push({
          field: f.field,
          label: f.label,
          value: userChoices.value[f.field] ?? '',
          selectedOptions: [],
        })
      })
    }

    stepForms.value.push(stepForm)
  }

  // 进入下一步
  function goToNextStep() {
    if (!currentFlow.value)
      return

    // 记录已完成步骤
    if (!completedStepCodes.value.includes(currentFlow.value.stepCode)) {
      completedStepCodes.value = [...completedStepCodes.value, currentFlow.value.stepCode]
    }

    // 获取下一步编码
    const nextCode = getNextStepCode(currentFlow.value, userChoices.value)

    if (nextCode) {
      const nextIndex = flows.value.findIndex(f => f.stepCode === nextCode)
      if (nextIndex !== -1) {
        currentStepCode.value = nextCode
        currentStepIndex.value = nextIndex
      }
    }
    else {
      // 流程结束
      toast.success('流程完成')
    }
  }

  // 返回上一步
  function goToPrevStep() {
    if (currentStepIndex.value <= 0)
      return
    const prevIndex = currentStepIndex.value - 1
    const prevFlow = flows.value[prevIndex]
    if (prevFlow) {
      currentStepCode.value = prevFlow.stepCode
      currentStepIndex.value = prevIndex
      // 从已完成列表中移除当前步骤
      completedStepCodes.value = completedStepCodes.value.filter(
        code => code !== currentFlow.value?.stepCode,
      )
    }
  }

  // 跳转到指定步骤
  function goToStep(stepCode: string) {
    const index = flows.value.findIndex(f => f.stepCode === stepCode)
    if (index !== -1) {
      currentStepCode.value = stepCode
      currentStepIndex.value = index
    }
  }

  // ==================== 站长重新生成模式 ====================

  /** 是否处于站长重新生成模式 */
  const isStationMode = ref(false)

  /** 站长修改意见 */
  const stationModifyPrompt = ref('')

  /**
   * 使用站长数据初始化向导
   * @param params 站长重新生成参数
   */
  function initWithStationData(params: {
    chatId: string
    /** 商户编码（站长模式下用于获取商户的动态数据） */
    merchantCode?: string
    steps: IWizardStepForm[]
  }) {
    if (!skillDetail.value || skillDetail.value.flows.length === 0)
      return

    const { steps, merchantCode } = params

    // 设置站长模式
    isStationMode.value = true
    stationModifyPrompt.value = ''

    // 站长模式下，chatId 不用于生成（避免消息直接进入会话）
    // 原始 chatId 由调用方保存，仅用于后续发送消息
    chatId.value = null

    // 站长模式：设置当前使用的商户编码，用于动态数据查询
    if (merchantCode) {
      stationMerchantCode.value = merchantCode
    }

    // 设置已完成步骤
    completedStepCodes.value = steps.map(s => s.stepCode)

    // 重建用户选择
    const choices: Record<string, any> = {}
    steps.forEach((step) => {
      step.fieldValues.forEach((fv) => {
        choices[fv.field] = fv.value
      })
    })
    userChoices.value = choices

    // 初始化所有步骤的表单结构（使用当前 dynamicDataMap 解析动态数据）
    skillDetail.value.flows.forEach((flow) => {
      initStepForm(flow)
    })

    // 设置步骤表单（用新初始化的结构替换，保留用户选择值）
    stepForms.value = steps.map((step) => {
      const initialized = stepForms.value.find(s => s.stepCode === step.stepCode)
      if (!initialized)
        return step

      // 合并：保留初始化后的结构（含 selectedOptions），但用传入的值覆盖
      return {
        ...initialized,
        fieldValues: initialized.fieldValues.map((fv) => {
          const incoming = step.fieldValues.find(f => f.field === fv.field)
          if (!incoming)
            return fv

          // 如果 dynamicDataMap 已有数据，从选项中查找匹配的 label/icon
          const flow = skillDetail.value!.flows.find(f => f.stepCode === step.stepCode)
          const fieldConfig = flow?.stepConfig?.fields?.find(f => f.field === fv.field)
          let selectedOptions = incoming.selectedOptions

          if (fieldConfig && dynamicDataMap.value) {
            const ds = parseFieldDataSource(fieldConfig)
            if (ds.isDynamic && ds.builtin) {
              const options = dynamicDataMap.value[ds.builtin]
              if (options && options.length > 0) {
                const matched = options.find(o => o.value === incoming.value)
                if (matched) {
                  selectedOptions = [matched]
                }
              }
            }
          }

          return {
            ...fv,
            value: incoming.value,
            selectedOptions,
          }
        }),
      }
    })

    // 跳转到生成步骤（actionType=2 的最后一个步骤，通常是 render）
    // 站长可以在此查看商户原图、输入修改意见、重新生成
    const generationFlows = skillDetail.value.flows.filter(f => f.actionType === 2)
    if (generationFlows.length > 0) {
      const lastGenFlow = generationFlows[generationFlows.length - 1]
      currentStepCode.value = lastGenFlow.stepCode
      currentStepIndex.value = skillDetail.value.flows.findIndex(
        f => f.stepCode === lastGenFlow.stepCode,
      )
    }
    else {
      // 如果没有生成步骤，跳到最后一个
      const lastFlow = skillDetail.value.flows[skillDetail.value.flows.length - 1]
      currentStepCode.value = lastFlow.stepCode
      currentStepIndex.value = skillDetail.value.flows.length - 1
    }

    // 重置生成状态，让站长可以重新生成
    generationStatus.value = null
    isGenerating.value = false
    isProcessing.value = false
  }

  /** 设置站长模式下使用的商户编码 */
  function setStationMerchantCode(code: string) {
    stationMerchantCode.value = code
  }

  /** 重置站长模式 */
  function resetStationMode() {
    isStationMode.value = false
    stationModifyPrompt.value = ''
    stationMerchantCode.value = undefined
  }

  // 流程式对话：自动调用，获取 aiContent 和图片生成任务ID
  const flowCompletionMutation = useFlowCompletionMutation()

  async function streamPrompt() {
    if (!currentFlow.value || !skillDetail.value)
      return

    isProcessing.value = true
    isGenerating.value = true
    generationStatus.value = 0
    generationError.value = null

    try {
      // 组装提交表单（仅包含已完成的用户选择步骤）
      const submitForm: IWizardSubmitForm = {
        skillId: skillId.value,
        // 站长模式下不传 chatId，避免消息直接进入原会话
        chatId: isStationMode.value ? null : chatId.value,
        steps: stepForms.value.filter(s =>
          completedStepCodes.value.includes(s.stepCode)
          || s.stepCode === currentFlow.value?.stepCode,
        ),
        // 站长模式下携带修改意见
        modifyPrompt: isStationMode.value ? stationModifyPrompt.value : undefined,
      }
      // 调用真实接口获取 aiContent 和图片生成任务ID
      const result = await flowCompletionMutation.mutateAsync(submitForm)

      if (result.code === 0 && result.data) {
        chatId.value = result.data.chatId
        aiContent.value = result.data.aiContent

        // 后端已启动图片生成，保存任务ID用于轮询
        // imageGenerationId 为字符串,'0'/'' 均表示未启动生成
        if (result.data.imageGenerationId && result.data.imageGenerationId !== '0') {
          generationId.value = result.data.imageGenerationId
        }

        // 如果图片已经生成成功（同步返回）
        if (result.data.imageStatus === 1) {
          generationStatus.value = 1
          isGenerating.value = false
        }
        // 如果图片生成失败
        else if (result.data.imageStatus === 2) {
          generationStatus.value = 2
          generationError.value = '图片生成失败'
          isGenerating.value = false
          toast.error('图片生成失败')
        }
        // imageStatus === 0 继续轮询
      }
      else {
        throw new Error(result.msg || '生成失败')
      }
    }
    catch (error) {
      isGenerating.value = false
      generationStatus.value = 2
      generationError.value = error instanceof Error ? error.message : '生成失败'
      toast.error(generationError.value)
    }
    finally {
      isProcessing.value = false
    }
  }

  // 图片生成查询：用户点击"下一步"后检查生成状态并进入结果页
  async function generateImage() {
    if (!currentFlow.value)
      return

    // 如果图片还在生成中，提示用户等待
    if (isGenerating.value && generationStatus.value !== 1) {
      toast.info('图片生成中，请稍候...')
      return
    }

    // 如果生成失败
    if (generationStatus.value === 2) {
      toast.error(generationError.value || '图片生成失败')
      return
    }

    // 生成成功，进入下一步（结果展示页）
    if (generationStatus.value === 1 && generatedImageUrl.value) {
      goToNextStep()
    }
  }

  // 记录已触发过对话的步骤，防止重复触发
  const processedStepCodes = ref<Set<string>>(new Set())

  // 进入 AI 生成步骤时自动调用流程式对话
  watch(currentFlow, (flow) => {
    if (!flow)
      return

    // 初始化当前步骤的表单结构
    initStepForm(flow)

    // 当进入 actionType === 2 的步骤且未触发过对话时，自动开始
    // 注意：现在改为用户手动点击生成按钮后触发，这里不再自动调用
    // 保留 processedStepCodes 用于防止重复触发
    if (flow.actionType === 2 && !processedStepCodes.value.has(flow.stepCode)) {
      processedStepCodes.value.add(flow.stepCode)
      // streamPrompt() // 移除自动调用，改为用户手动触发
    }
  })

  // 轮询查询生成结果
  const imageGenerationResultQuery = useGetImageGenerationResultQuery(generationId, generationStatus)

  // 监听查询结果变化，更新生成状态
  watch(() => imageGenerationResultQuery.data.value, (data) => {
    if (!data || !data.data)
      return

    const result = data.data

    if (result.status === 1) {
      // 生成成功
      generationStatus.value = 1
      generatedImageUrl.value = result.imageUrl
      isGenerating.value = false
      // 自动生成完成，自动进入下一步（完成页面）
      goToNextStep()
    }
    else if (result.status === 2) {
      // 生成失败
      generationStatus.value = 2
      generationError.value = '图片生成失败'
      isGenerating.value = false
      toast.error('图片生成失败')
    }
    // status === 0 继续轮询（由 useQuery 自动处理）
  })

  // 监听查询错误
  watch(() => imageGenerationResultQuery.error.value, (error) => {
    if (error) {
      console.error('图片生成查询失败:', error)
    }
  })

  // 重新生成：回到生成步骤的确认页，让用户手动点击生成
  function handleRegenerate() {
    generationId.value = null
    generatedImageUrl.value = null
    generationStatus.value = null
    generationError.value = null
    aiContent.value = ''
    isProcessing.value = false
    isGenerating.value = false
    // 从已完成列表中移除完成页和生成步骤，回到生成步骤确认页
    const currentCode = currentFlow.value?.stepCode
    if (currentCode) {
      completedStepCodes.value = completedStepCodes.value.filter(
        code => code !== currentCode,
      )
    }
    // 找到当前的上一步（生成步骤）
    const prevIndex = currentStepIndex.value - 1
    if (prevIndex >= 0) {
      const prevFlow = flows.value[prevIndex]
      if (prevFlow) {
        currentStepCode.value = prevFlow.stepCode
        currentStepIndex.value = prevIndex
        // 也从已完成列表中移除生成步骤
        completedStepCodes.value = completedStepCodes.value.filter(
          code => code !== prevFlow.stepCode,
        )
        // 重置 processedStepCodes，允许再次触发
        processedStepCodes.value.delete(prevFlow.stepCode)
      }
    }
  }

  // 重置向导
  function resetWizard() {
    userChoices.value = {}
    stepForms.value = []
    completedStepCodes.value = []
    chatId.value = null
    isGenerating.value = false
    generationId.value = null
    generatedImageUrl.value = null
    generationStatus.value = null
    generationError.value = null
    aiContent.value = ''
    isProcessing.value = false

    if (skillDetail.value && skillDetail.value.flows.length > 0) {
      currentStepCode.value = skillDetail.value.flows[0].stepCode
      currentStepIndex.value = 0
    }
  }

  // 当 skillId 变化时重置向导状态（切换不同技能时）
  watch(skillId, () => {
    resetWizard()
    // 清空动态数据缓存，确保重新加载
    dynamicDataMap.value = {}
    // 清空对话触发记录
    processedStepCodes.value = new Set()
    // 重置 builtin 查询
    builtinGoods.value = null
    builtinPromo.value = null
  })

  return {
    // 技能详情
    skillDetail,
    isDetailLoading,
    flows,

    // 步骤控制
    currentStepIndex,
    currentStepCode,
    currentFlow,
    completedStepCodes,
    totalSteps,
    progressPercent,

    // 用户选择
    userChoices,
    stepForms,
    currentStepConfig,
    isCurrentStepValid,
    makeChoice,

    // 动态数据源
    dynamicDataMap,
    setDynamicData,

    // 步骤导航
    goToNextStep,
    goToPrevStep,
    goToStep,

    // AI 生成
    chatId,
    isGenerating,
    generationId,
    generatedImageUrl,
    generationStatus,
    generationError,
    aiContent,
    isProcessing,
    streamPrompt,
    generateImage,
    handleRegenerate,

    // 站长模式
    isStationMode,
    stationModifyPrompt,
    initWithStationData,
    setStationMerchantCode,
    resetStationMode,

    // 重置
    resetWizard,
  }
}
