import { toast } from 'vue-sonner'
import { z } from 'zod'

/**
 * 可选数字字段。
 *
 * 兼容两类脏输入,统一转为 number 或 undefined:
 * - 后端回显的 null(z.number().optional() 不接受 null,会导致校验静默失败)
 * - Input type="number" 吐出的字符串(原生 v-model 无 .number 修饰符)
 */
export const optionalNumber = z.union([z.number(), z.string(), z.null()]).optional().transform((v) => {
  if (v === '' || v === null || v === undefined)
    return undefined
  const num = typeof v === 'string' ? Number(v) : v
  return Number.isNaN(num) ? undefined : num
})

/** 可选整数字段(排序、序号等):在 optionalNumber 基础上要求整数,非整数校验失败提示「请输入整数」。 */
export const optionalInt = optionalNumber.refine(
  v => v === undefined || Number.isInteger(v),
  { message: '请输入整数' },
)

/** 可选字符串字段:兼容后端回显的 null,统一转为 undefined */
export const optionalString = z.string().nullable().optional().transform(v => v ?? undefined)

/**
 * handleSubmit 校验失败兜底回调,作为第二个参数传入:
 * `handleSubmit(onValid, showInvalidSubmitToast)`
 *
 * 校验错误可能挂在被 v-if 隐藏的字段上(toTypedSchema 校验整个表单对象),
 * 此时无 FormMessage 可显示,toast 提示避免"点击提交无反应"的静默失败。
 */
export function showInvalidSubmitToast({ errors }: { errors: Partial<Record<string, string | undefined>> }) {
  const [field, message] = Object.entries(errors)[0] ?? []
  if (field)
    toast.error(`校验未通过: ${field} - ${message}`)
}
