interface RoleAwareItem {
  roles?: number[]
}

/**
 * 按角色过滤导航项:
 * - 无 roles 的项:所有用户可见(保留)
 * - 有 roles 的项:仅当前 userType 命中 roles 时可见;userType 未知(undefined)时隐藏受限项
 *
 * 抽出为纯函数便于测试;use-sidebar.ts 中「通用」菜单组与「设置」子菜单复用。
 */
export function filterNavItemsByRoles<T extends RoleAwareItem>(items: T[], userType: number | undefined): T[] {
  return items.filter((item) => {
    if (!item.roles)
      return true
    return userType !== undefined && item.roles.includes(userType)
  })
}
