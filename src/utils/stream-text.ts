/**
 * 累积流式文本。
 *
 * 后端各模型分片策略不一致：多数按增量下发，部分带 `fullFlag=true` 每帧下发全量快照，
 * 一律累加会让全量模型的内容重复膨胀，故按 `fullFlag` 决定覆盖还是追加。
 * `fullFlag` 可能被序列化成字符串，这里同时兼容 `'true'`。
 * @param current 已累积的文本
 * @param chunk 本次事件的文本
 * @param fullFlag 本次文本是否为全量快照
 */
export function mergeStreamText(
  current: string,
  chunk?: string | null,
  fullFlag?: boolean | string | null,
): string {
  if (!chunk)
    return current
  const isFullSnapshot = fullFlag === true || fullFlag === 'true'
  return isFullSnapshot ? chunk : current + chunk
}
