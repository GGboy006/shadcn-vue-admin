/** 不需要登录就能访问的页面(精确匹配) */
const WHITE_LIST = ['/auth/sign-in', '/auth/sign-up', '/errors/403', '/errors/404', '/errors/401', '/errors/500', '/errors/503']

export const MARKETING_HOME = '/marketing'

/** 未登录可访问:登录/错误页,以及官网 /marketing */
export function isPublicPath(path: string): boolean {
  if (path.startsWith('/auth') || path.startsWith('/marketing'))
    return true
  return WHITE_LIST.includes(path)
}
