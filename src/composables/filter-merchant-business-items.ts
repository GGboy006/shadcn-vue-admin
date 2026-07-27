import type { NavItem } from '@/components/app-sidebar/types'

/**
 * 商户后台菜单项的过滤入参。
 */
interface FilterContext {
  /** 当前用户类型:3=站长,4=商户,5=物业 */
  userType?: number
  /** 是否处于站长代客模式 */
  proxyMode: boolean
}

/**
 * 过滤商户后台菜单项:
 * - selfOnly 项(如「商户资料」)仅在 userType 为商户/物业(4/5)时可见,其余身份过滤掉
 * - 其余项对所有身份可见
 *
 * 抽出为纯函数便于测试。当前代客菜单已与商户一致(use-sidebar 经 effectiveUserType
 * 以商户身份调用),selfOnly 在产品流程中不再触发隐藏,标记保留备未来区分需求。
 */
export function filterMerchantBusinessItems(items: NavItem[], ctx: FilterContext): NavItem[] {
  const isSelf = ctx.userType === 4 || ctx.userType === 5
  // 非商户/物业身份时,selfOnly 项隐藏
  const hideSelfOnly = !isSelf
  return items.filter((item) => {
    if (hideSelfOnly && (item as NavItem & { selfOnly?: boolean }).selfOnly) {
      return false
    }
    return true
  })
}
