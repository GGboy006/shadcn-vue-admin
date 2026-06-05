/** 动作类型：1=用户选择 2=AI生成 3=用户输入 4=确认/结束 */
export type SkillActionType = 1 | 2 | 3 | 4

/** 输入类型：1=单选 2=多选 3=文本输入 4=图片上传 5=无 */
export type SkillFlowInputType = 1 | 2 | 3 | 4 | 5

/** AI技能流程节点详情 */
export interface ISkillFlow {
  /** 流程节点ID */
  flowId: number
  /** 所属技能ID */
  skillId: number
  /** 步骤编码（唯一标识） */
  stepCode: string
  /** 步骤名称 */
  stepName: string
  /** 步骤排序 */
  stepOrder: number
  /** 动作类型：1=用户选择 2=AI生成 3=用户输入 4=确认/结束 */
  actionType: SkillActionType
  /** 输入类型：1=单选 2=多选 3=文本输入 4=图片上传 5=无 */
  inputType: SkillFlowInputType
  /** 步骤引导文案（AI气泡话术） */
  description: string
  /** Prompt模板，支持占位符如 ${scene} */
  promptTemplate: string
  /** 步骤配置（含多字段定义） */
  stepConfig: IStepConfig | null
  /** 默认下一步编码，null表示流程结束 */
  nextStepCode: string | null
  /** 分支规则（JSON）：根据当前选择跳不同步骤 */
  branchRule: string | null
  /** 是否必填：1=是 0=否 */
  isRequired: 1 | 0
  /** 状态：1=启用 2=禁用 */
  status: 1 | 2
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 选项数据 */
export interface IChoiceOption {
  value: string
  label: string
  desc?: string
  icon?: string
  preview?: string
}

/** 字段数据来源类型 */
export type FieldDataSourceType = 0 | 1 | 4

/** 步骤字段配置 */
export interface IStepField {
  /** 字段名（存入选项结果的key） */
  field: string
  /** 字段显示标签 */
  label: string
  /** 输入类型：1=单选 2=多选 3=文本 4=图片上传 */
  inputType: number
  /** 是否必填 */
  required: boolean
  /** 选项渲染方式 */
  layout: 'list' | 'grid'
  /** 数据来源：0=无 1=静态JSON 4=内置数据源 */
  dataSourceType: FieldDataSourceType
  /** 具体数据配置（静态数组或内置数据源对象） */
  dataSourceConfig: IChoiceOption[] | IBuiltinDataSourceConfig
}

/** 步骤配置 */
export interface IStepConfig {
  /** 步骤整体布局 */
  layout: 'grouped' | 'list' | 'grid' | 'single' | 'none'
  /** 步骤标题 */
  title: string
  /** 字段配置数组 */
  fields: IStepField[]
}

/** 分支规则 */
export interface IBranchRule {
  field: string
  conditions: {
    value: string
    nextStep: string
  }[]
}

/** 技能详情（含流程节点） */
export interface ISkillDetail {
  /** 技能ID */
  skillId: number
  /** 技能名称 */
  name: string
  /** 技能图标URL */
  icon: string
  /** 技能描述 */
  description: string
  /** 输入类型：1=文本，2=图片，3=音频，4=混合 */
  inputType: number
  /** 能力标签 */
  tags: string[] | null
  /** 分配状态：1=生效中，2=暂停，3=过期 */
  assignStatus: number | null
  /** 工具模式：1=单次对话，2=流程式向导 */
  toolMode: number
  /** 流程节点列表 */
  flows: ISkillFlow[]
}

/** AI图片生成信息 */
export interface IAIImageGeneration {
  /** 主键 */
  id: number
  /** 会话ID */
  chatId: string
  /** 调用用户 ID */
  userId: number
  /** 平台标识 */
  provider: string
  /** 模型名称 */
  model: string
  /** 提示词 */
  prompt: string
  /** 图片尺寸 */
  size: string
  /** 图片质量 */
  quality: string
  /** 背景类型 */
  background: string
  /** 输出格式 */
  outputFormat: string
  /** OSS 图片地址 */
  imageUrl: string
  /** 参考图片URL */
  referenceImageUrl: string[]
  /** 生成状态：0=生成中 1=成功 2=失败 */
  status: 0 | 1 | 2
  /** 输入 token 数 */
  inputTokens: number
  /** 输出 token 数 */
  outputTokens: number
  /** 总 token 数 */
  totalTokens: number
  /** OpenAI 返回的创建时间戳 */
  created: number
  /** 外部平台任务ID */
  taskId: string
}

/** 流式对话表单 */
export interface IChatForm {
  /** 会话ID（为空则新建会话） */
  chatId: string | null
  /** 消息内容 */
  content: string
  /** 消息类型 */
  messageType?: string
  /** 附件文件列表 */
  files?: { fileId: string, fileType: string }[]
}

/** 流程式对话结果 VO */
export interface IFlowCompletionVO {
  /** 会话ID */
  chatId: string
  /** AI文本回复内容 */
  aiContent: string
  /** 图片生成记录ID */
  imageGenerationId: number
  /** 图片生成状态：0-生成中 1-成功 2-失败 */
  imageStatus: 0 | 1 | 2
  /** 用户消息ID */
  userMessageId: string
  /** AI消息ID */
  aiMessageId: string
}

/** 图片生成请求 */
export interface IQuicklyCreateRequest {
  /** 会话ID */
  chatId: string
  /** 模型名称 */
  model?: string
  /** 图片生成提示词 */
  prompt: string
  /** 输出图像比例 */
  size?: string
  /** 参考图片的URL */
  urls?: string[]
}

/** 技能流程动态数据 VO（dataSourceType=4 时接口返回） */
export interface ISkillFlowDataVO {
  /** 商户标识 */
  merchantCode: string
  /** 唯一标识（作为选项 value） */
  uniqueCode: string
  /** 名称（作为选项 label） */
  name: string
  /** 封面图URL（作为选项 preview） */
  poster: string
  /** 简介（作为选项 desc） */
  describes: string
  /** 金额 */
  salePrice: number
  /** 内容 */
  content: string
}

/** 内置数据源配置 */
export interface IBuiltinDataSourceConfig {
  /** 内置数据源标识 */
  builtin: string
  /** 数量限制 */
  limit?: number
  /** 要展示的字段 */
  show_fields?: string[]
}

/** 向导状态 */
export interface IWizardState {
  skillId: string
  skillDetail: ISkillDetail | null
  currentStepIndex: number
  currentStepCode: string
  completedStepCodes: string[]
  userChoices: Record<string, any>
  chatId: string | null
  isGenerating: boolean
  generationId: number | null
  generatedImageUrl: string | null
  generationStatus: 0 | 1 | 2 | null
  generationError: string | null
  streamingContent: string
  isStreaming: boolean
}

// ==================== Prompt 生成表单类型 ====================

/** 提交给后端的完整向导表单 */
export interface IWizardSubmitForm {
  /** 技能ID */
  skillId: string
  /** 会话ID（首次为空） */
  chatId: string | null
  /** 所有步骤的选择数据 */
  steps: IWizardStepForm[]
}

/** 单个步骤的表单数据 */
export interface IWizardStepForm {
  /** 流程节点ID（数据库主键） */
  flowId: number
  /** 步骤编码（业务标识） */
  stepCode: string
  /** 步骤名称 */
  stepName: string
  /** 该步骤的所有字段选择 */
  fieldValues: IWizardFieldValue[]
}

/** 字段选择值 */
export interface IWizardFieldValue {
  /** 字段名（如 scene, dishes, style） */
  field: string
  /** 字段标签 */
  label: string
  /** 选中的值（单选为 string，多选为 string[]） */
  value: string | string[]
  /** 选中的选项完整信息 */
  selectedOptions: ISelectedOption[]
}

/** 选中选项的完整信息 */
export interface ISelectedOption {
  /** 选项值 */
  value: string
  /** 选项显示名称 */
  label: string
  /** 描述文案 */
  desc?: string
  /** 图标/Emoji */
  icon?: string
  /** 预览图URL */
  preview?: string
  /** 金额（动态数据源-商品用） */
  salePrice?: number
  /** 内容（动态数据源用） */
  content?: string
}
