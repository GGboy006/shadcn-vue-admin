import { z } from 'zod'
import { zhCN } from 'zod/v4/locales'

const { localeError } = zhCN()

/**
 * zod 类型名中文映射。
 *
 * 官方 zh-CN locale 的 TypeDictionary 仅收录了 number/array/null/nan,
 * 遗漏 string/boolean/object/date 等类型名,导致「期望 string」「实际接收 string」不中不洋。
 * 此表补全官方遗漏的条目。
 */
const TYPE_CN: Record<string, string> = {
  string: '字符串',
  number: '数字',
  int: '整数',
  boolean: '布尔值',
  bigint: '大整数',
  symbol: 'symbol',
  undefined: '未定义',
  null: '空值(null)',
  never: 'never',
  void: 'void',
  date: '日期',
  array: '数组',
  object: '对象',
  tuple: '元组',
  record: '记录',
  map: 'Map',
  set: 'Set',
  file: '文件',
  nonoptional: '非可选',
  nan: 'NaN',
  function: '函数',
}

/** 推断输入值的中文类型名(用于 invalid_type 的「实际接收」部分)。 */
function describeInput(input: unknown): string {
  if (input === null)
    return TYPE_CN.null!
  if (Array.isArray(input))
    return TYPE_CN.array!
  return TYPE_CN[typeof input] ?? typeof input
}

/**
 * 注册 zod 全局中文错误信息。
 *
 * 背景:zod 默认 errorMap 为英文(如 "Invalid input: expected string, received null"),
 * 经 @vee-validate/zod 的 toTypedSchema 透传 issue.message 后,FormMessage 直接显示原文。
 *
 * 此处应用官方 zh-CN locale 使未自定义 message 的字段显示中文;并补全官方 locale
 * 遗漏的类型名(string/boolean/date 等),让 invalid_type 错误「期望 字符串,实际接收 空值(null)」完整中文化。
 *
 * 字段上显式自定义的 message(如 `.min(1, '商品名称不能为空')`)优先级高于 locale,不受影响。
 *
 * zod v4 locale 用法:`zhCN()` 返回 `{ localeError }`,此处包装后传入 `z.config`。
 */
export function setupZod() {
  z.config({
    localeError: (issue) => {
      // 补全 invalid_type 的类型名(官方 locale 漏译 string/boolean/date 等)
      if (issue.code === 'invalid_type') {
        const expected = TYPE_CN[issue.expected] ?? issue.expected
        const received = describeInput(issue.input)
        if (/^[A-Z]/.test(issue.expected))
          return `无效输入：期望 instanceof ${issue.expected}，实际接收 ${received}`
        return `无效输入：期望 ${expected}，实际接收 ${received}`
      }
      // 其他错误码(too_small / invalid_format / invalid_value 等)交给官方 locale
      return localeError(issue)
    },
  })
}
