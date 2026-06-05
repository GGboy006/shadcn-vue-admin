import type { IAIImageGeneration, IFlowCompletionVO, IWizardSubmitForm } from '../types/wizard.types'

/** 静态 Mock：流程式对话返回 */
const MOCK_FLOW_RESPONSE: { code: number, message: string, data: IFlowCompletionVO } = {
  code: 0,
  message: 'success',
  data: {
    chatId: 2062472013157679000,
    aiContent: '请根据以下信息生成宣传图片：\n\n请根据以下信息生成内容：\n\n【营销场景】\n营销场景：促销活动（满减/折扣/会员日/充值送）\n\n【展示内容】\n选择菜品：红烧牛肉面（¥30 · 红烧牛肉面，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png）\n促销信息：满50减20（一次消费50减20元）\n时间信息：立即开始\n\n【视觉风格】\n视觉风格：高端黑金风（适合高端菜品，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg）\n\n【生成海报】\n\n\n请使用以下素材图片作为参考：\n素材1图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png\n素材2图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg\n',
    imageGenerationId: 11,
    imageStatus: 0,
    userMessageId: '6a214a5d2afd6546999d3ed8',
    aiMessageId: '6a214a5d2afd6546999d3ed9',
  },
}

/** 静态 Mock：图片生成中 */
const MOCK_IMAGE_GENERATING: { code: number, message: string, data: IAIImageGeneration } = {
  code: 0,
  message: 'success',
  data: {
    id: 11,
    chatId: 2062472013157679000,
    userId: 2062054742946767000,
    provider: 'suchuang',
    model: 'gpt-image-2',
    prompt: '请根据以下信息生成宣传图片：\n\n请根据以下信息生成内容：\n\n【营销场景】\n营销场景：促销活动（满减/折扣/会员日/充值送）\n\n【展示内容】\n选择菜品：红烧牛肉面（¥30 · 红烧牛肉面，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png）\n促销信息：满50减20（一次消费50减20元）\n时间信息：立即开始\n\n【视觉风格】\n视觉风格：高端黑金风（适合高端菜品，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg）\n\n【生成海报】\n\n\n请使用以下素材图片作为参考：\n素材1图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png\n素材2图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg\n',
    size: 'auto',
    quality: '',
    background: '',
    outputFormat: '',
    imageUrl: '',
    referenceImageUrl: [],
    status: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    created: 0,
    taskId: 'image_1c5d1387-f2f5-4605-b199-67eebab0b1a3',
  },
}

/** 静态 Mock：图片生成完成 */
const MOCK_IMAGE_COMPLETED: { code: number, message: string, data: IAIImageGeneration } = {
  code: 0,
  message: 'success',
  data: {
    id: 11,
    chatId: 2062472013157679000,
    userId: 2062054742946767000,
    provider: 'suchuang',
    model: 'gpt-image-2',
    prompt: '请根据以下信息生成宣传图片：\n\n请根据以下信息生成内容：\n\n【营销场景】\n营销场景：促销活动（满减/折扣/会员日/充值送）\n\n【展示内容】\n选择菜品：红烧牛肉面（¥30 · 红烧牛肉面，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png）\n促销信息：满50减20（一次消费50减20元）\n时间信息：立即开始\n\n【视觉风格】\n视觉风格：高端黑金风（适合高端菜品，图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg）\n\n【生成海报】\n\n\n请使用以下素材图片作为参考：\n素材1图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/digital_cms_image/20260403/1775200054364.png\n素材2图片地址：https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/artificial/pre-built/black-gold.jpg\n',
    size: 'auto',
    quality: '',
    background: '',
    outputFormat: '',
    imageUrl: 'https://citymedia.oss-cn-wulanchabu.aliyuncs.com/residential-station-manager/ai-image/20260604/1780567428345.png',
    referenceImageUrl: [],
    status: 1,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    created: 0,
    taskId: 'image_1c5d1387-f2f5-4605-b199-67eebab0b1a3',
  },
}

/** Mock 调用次数（用于模拟轮询过程） */
let mockPollCount = 0

/** 重置 Mock 计数 */
export function resetMockPollCount() {
  mockPollCount = 0
}

/**
 * Mock 流程式对话接口（非流式）
 * 模拟网络延迟 500ms
 */
export async function mockFlowCompletion(_data: IWizardSubmitForm): Promise<{ code: number, message: string, data: IFlowCompletionVO }> {
  // 重置轮询计数
  resetMockPollCount()

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  return { ...MOCK_FLOW_RESPONSE }
}

/**
 * Mock 图片生成结果查询接口
 * 前 10 次返回生成中，第 11 次返回已完成
 * 模拟网络延迟 300ms
 */
export async function mockImageGenerationQuery(_id: number | null): Promise<{ code: number, message: string, data: IAIImageGeneration }> {
  await new Promise(resolve => setTimeout(resolve, 300))

  mockPollCount++

  // 前 10 次返回生成中，第 11 次返回完成（约 33 秒总时长）
  if (mockPollCount < 1) {
    return { ...MOCK_IMAGE_GENERATING }
  }

  return { ...MOCK_IMAGE_COMPLETED }
}

/**
 * 使用 Mock 数据替换真实接口
 * 在 use-wizard.ts 中替换 useFlowCompletionMutation 和 useGetImageGenerationResultQuery
 *
 * 使用方式：
 * 1. 导入本文件的 mockFlowCompletion 和 mockImageGenerationQuery
 * 2. 在 streamPrompt 中调用 mockFlowCompletion 代替 flowCompletion
 * 3. 在轮询逻辑中调用 mockImageGenerationQuery 代替 useGetImageGenerationResultQuery
 */
