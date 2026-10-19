import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    // if true, need user login
    auth?: boolean
    layout?: 'fixed'
    /** 仅 query 变化时复用当前页，避免整页重挂载把内部滚动位置清掉 */
    reuseOnQuery?: boolean
  }
}
