/**
 * 对话流生图卡片。
 *
 * CUSTOM name=artifact、bizType=imageGeneration 时，前端先展示卡片，
 * 再按 pollImage 轮询 GET /aiImage/generations/{id}。
 */

export interface ImageGenerationCard {
  artifactId: string
  title: string
  summary: string
  imageGenerationId: string
  size: string
  /** 仅允许 /aiImage/generations/{id} */
  pollTarget: string
  actionLabel: string
}

export interface ImageGenerationPollResult {
  status: 0 | 1 | 2
  imageUrl: string
  size: string
}

const POLL_PATH = /^\/aiImage\/generations\/[^/?#]+$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()
  if (typeof value === 'number' && Number.isFinite(value))
    return String(value)
  return ''
}

function readBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown
      return isRecord(parsed) ? parsed : null
    }
    catch {
      return null
    }
  }
  return isRecord(body) ? body : null
}

function pollTargetFor(id: string, actionTarget: string): string {
  if (POLL_PATH.test(actionTarget))
    return actionTarget
  return `/aiImage/generations/${id}`
}

function parseJsonRecord(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value) as unknown
    return isRecord(parsed) ? parsed : null
  }
  catch {
    return null
  }
}

/**
 * 流式 CUSTOM 的 payload 是对象。
 * 会话详情 parts[].artifact.payload 是 JSON 字符串，解析失败时再把整段 artifact 当卡。
 */
function resolveCardPayload(value: Record<string, unknown>): Record<string, unknown> {
  if (typeof value.payload === 'string')
    return parseJsonRecord(value.payload) ?? value
  if (isRecord(value.payload))
    return value.payload
  return value
}

/** 从流式 artifact 或历史 parts.artifact 抽出生图卡片；其他卡片返回 null */
export function parseImageGenerationArtifact(value: unknown): ImageGenerationCard | null {
  if (!isRecord(value))
    return null

  const artifactType = readString(value.artifactType)
  if (artifactType && artifactType !== 'card')
    return null

  const payload = resolveCardPayload(value)
  const bizType = readString(payload.bizType)
  const actions = Array.isArray(payload.actions) ? payload.actions : []
  const pollAction = actions.find((item) => {
    return isRecord(item) && readString(item.action) === 'pollImage'
  })
  if (bizType !== 'imageGeneration' && !pollAction)
    return null

  const body = readBody(payload.body)
  const imageGenerationId = readString(payload.imageGenerationId)
    || readString(payload.bizId)
    || readString(body?.imageGenerationId)
  if (!imageGenerationId)
    return null

  const actionTarget = isRecord(pollAction) ? readString(pollAction.target) : ''
  const tags = Array.isArray(payload.tags) ? payload.tags.map(readString).filter(Boolean) : []
  const size = readString(payload.size)
    || readString(body?.size)
    || tags.find(tag => /^\d+\s*[:x×*]\s*\d+$/i.test(tag))
    || ''

  return {
    artifactId: readString(value.artifactId) || `imageGeneration:${imageGenerationId}`,
    title: readString(payload.title) || readString(value.title) || '海报',
    summary: readString(payload.summary) || readString(value.summary),
    imageGenerationId,
    size,
    pollTarget: pollTargetFor(imageGenerationId, actionTarget),
    actionLabel: (isRecord(pollAction) && readString(pollAction.label)) || '查看海报',
  }
}

export function isImageGenerationCard(value: unknown): value is ImageGenerationCard {
  if (!isRecord(value))
    return false
  return typeof value.imageGenerationId === 'string'
    && value.imageGenerationId.length > 0
    && typeof value.pollTarget === 'string'
    && POLL_PATH.test(value.pollTarget)
}

function readStatus(value: unknown): 0 | 1 | 2 | null {
  const status = typeof value === 'string' ? Number(value) : value
  if (status === 0 || status === 1 || status === 2)
    return status
  return null
}

/** 兼容 { code, data } 与裸对象；状态未返回时视为仍在生成 */
export function normalizeImageGenerationPoll(raw: unknown, fallbackSize = ''): ImageGenerationPollResult {
  const root = isRecord(raw) ? raw : {}
  const data = isRecord(root.data) ? root.data : root
  return {
    status: readStatus(data.status) ?? 0,
    imageUrl: readString(data.imageUrl) || readString(data.url) || readString(data.fileUrl),
    size: readString(data.size) || fallbackSize,
  }
}
