interface RoleAwareItem {
  roles?: number[]
  items?: RoleAwareItem[]
}

/**
 * 按角色过滤导航项(支持二级嵌套):
 * - 无 roles 的项:所有用户可见(保留)
 * - 有 roles 的项:仅当前 userType 命中 roles 时可见;userType 未知(undefined)时隐藏受限项
 * - 父菜单(有 items):递归过滤子项;子项过滤后为空则隐藏整组父菜单
 *
 * 抽出为纯函数便于测试;use-sidebar.ts 中各菜单组与「设置」复用。
 */
export function filterNavItemsByRoles<T extends RoleAwareItem>(items: T[], userType: number | undefined): T[] {
  return items
    .map((item): T => {
      if (item.items)
        return { ...item, items: filterNavItemsByRoles(item.items, userType) } as T
      return item
    })
    .filter((item) => {
      // 父菜单:子项过滤后为空则隐藏整组
      if (item.items && item.items.length === 0)
        return false
      if (!item.roles)
        return true
      return userType !== undefined && item.roles.includes(userType)
    })
}
