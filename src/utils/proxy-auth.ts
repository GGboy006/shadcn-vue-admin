/**
 * 代客模式(新标签页换商户 token)的基础设施工具。
 *
 * 两类存储,职责不同:
 * - sessionStorage(标签页级):代客标签页标记 __proxy_tab__,关页即销毁
 * - localStorage(跨标签页):一次性中转数据 __proxy_auth__{key},站长标签页写入、
 *   代客标签页启动读取后立即清除
 *
 * authStore/userInfoStore 的 persist storage 由 resolveAuthStorage() 决定:
 * 代客标签页用 sessionStorage(与站长 localStorage 隔离),其余用 localStorage。
 */

const PROXY_TAB_KEY = '__proxy_tab__'
const PROXY_AUTH_PREFIX = '__proxy_auth__'

/**
 * 是否为代客标签页(模块加载时判定)。
 * - 首次进入:URL 含 ?proxy(代客入口页)
 * - 刷新后:URL 已无 proxy,但 sessionStorage 已有标记(proxy-entry 启动时写入)
 */
function isProxyTabAtLoad(): boolean {
  if (typeof window === 'undefined')
    return false
  const hasProxyQuery = new URLSearchParams(window.location.search).has('proxy')
  const hasMark = sessionStorage.getItem(PROXY_TAB_KEY) === '1'
  return hasProxyQuery || hasMark
}

/**
 * 动态 persist storage:代客标签页用 sessionStorage(标签页隔离),
 * 其余标签页用 localStorage(全局,站长/商户自身登录)。
 *
 * 供 auth.ts / user-info.ts 的 persist 配置使用。
 */
export function resolveAuthStorage(): Storage {
  return isProxyTabAtLoad() ? sessionStorage : localStorage
}

/**
 * 懒 Storage:首次被读/写时才调用 resolveAuthStorage() 判定用哪个 storage。
 *
 * store 模块加载时 persist 配置会求值 storage 字段,若直接用 resolveAuthStorage()
 * 会在模块加载阶段访问 sessionStorage/localStorage,导致 node 测试环境(无 DOM)崩溃。
 * 用 Proxy 包装,把 DOM 访问推迟到 persist 插件真正读写的时刻。
 */
export const lazyAuthStorage = new Proxy({} as Storage, {
  get(_target, prop: string | symbol) {
    const storage = resolveAuthStorage()
    const value = Reflect.get(storage, prop)
    return typeof value === 'function' ? value.bind(storage) : value
  },
})

/** 标记当前标签页为代客标签页(proxy-entry 启动时调用,刷新后仍能判定) */
export function markProxyTab(): void {
  sessionStorage.setItem(PROXY_TAB_KEY, '1')
}

/** 运行时判定当前是否代客标签页(proxy-banner 等读取) */
export function isProxyTab(): boolean {
  if (typeof window === 'undefined')
    return false
  return sessionStorage.getItem(PROXY_TAB_KEY) === '1'
}

/** 清除代客标签页标记(登出/异常时) */
export function clearProxyTab(): void {
  sessionStorage.removeItem(PROXY_TAB_KEY)
}

/** 生成中转 key(随机,放 URL ?k=,避免连点多个商户时中转互相覆盖) */
export function generateProxyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID()
  // 兜兜底(crypto 不可用时)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 写入中转数据到 localStorage(跨标签页可见)。
 * 站长标签页换 token 后调用,随后 window.open 代客入口页。
 */
export function writeProxyAuth<T>(data: T, key: string): void {
  localStorage.setItem(PROXY_AUTH_PREFIX + key, JSON.stringify(data))
}

/** 读取中转数据(代客入口页启动时调用)。无或解析失败返回 null。 */
export function readProxyAuth<T>(key: string): T | null {
  const raw = localStorage.getItem(PROXY_AUTH_PREFIX + key)
  if (!raw)
    return null
  try {
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

/** 清除中转数据(代客入口页读取后立即调用,保证一次性) */
export function clearProxyAuth(key: string): void {
  localStorage.removeItem(PROXY_AUTH_PREFIX + key)
}

/**
 * 轮询读取中转数据,直到命中或超时。
 *
 * 父窗口先同步 open 代客入口页(用户手势内避免弹窗拦截),再异步换 token 写中转;
 * 入口页启动时中转可能尚未就绪,故轮询等待。
 *
 * 先同步读一次(快路径:父窗口已写好的常见情况),命中则不启动定时器。
 *
 * @param read 读取函数(注入以便测试,生产为 () => readProxyAuth<T>(key))
 * @param timeoutMs 超时毫秒,超时返回 null(入口页显示错误)
 * @param intervalMs 轮询间隔,默认 200ms
 */
export function waitForProxyAuth<T>(
  read: () => T | null,
  timeoutMs: number,
  intervalMs = 200,
): Promise<T | null> {
  return new Promise((resolve) => {
    const direct = read()
    if (direct) {
      resolve(direct)
      return
    }
    const start = Date.now()
    const timer = setInterval(() => {
      const data = read()
      if (data) {
        clearInterval(timer)
        resolve(data)
        return
      }
      if (Date.now() - start >= timeoutMs) {
        clearInterval(timer)
        resolve(null)
      }
    }, intervalMs)
  })
}
