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
 * - selfOnly 项(如「商户资料」)仅商户/物业自身可见,站长代客过滤掉
 * - 其余项对商户/物业自身 与 站长代客都可见
 *
 * 抽出为纯函数便于测试;use-sidebar.ts 在 computed 中调用。
 */
export function filterMerchantBusinessItems(items: NavItem[], ctx: FilterContext): NavItem[] {
  const isSelf = ctx.userType === 4 || ctx.userType === 5
  // 站长代客时,selfOnly 项隐藏;商户/物业自身时全部可见
  const hideSelfOnly = !isSelf
  return items.filter((item) => {
    if (hideSelfOnly && (item as NavItem & { selfOnly?: boolean }).selfOnly) {
      return false
    }
    return true
  })
}
