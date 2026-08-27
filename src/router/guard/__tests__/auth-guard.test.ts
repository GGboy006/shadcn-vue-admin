import { describe, expect, it } from 'vitest'

import { isPublicPath, MARKETING_HOME } from '@/router/guard/public-path'

describe('isPublicPath', () => {
  it('放行官网及其子路径', () => {
    expect(isPublicPath('/marketing')).toBe(true)
    expect(isPublicPath('/marketing/')).toBe(true)
    expect(isPublicPath('/marketing/hello')).toBe(true)
  })

  it('放行登录与错误页', () => {
    expect(isPublicPath('/auth/sign-in')).toBe(true)
    expect(isPublicPath('/auth/sign-up')).toBe(true)
    expect(isPublicPath('/errors/404')).toBe(true)
  })

  it('后台路径未登录不可直接进', () => {
    expect(isPublicPath('/dashboard')).toBe(false)
    expect(isPublicPath('/')).toBe(false)
    expect(isPublicPath('/merchant-business/overview')).toBe(false)
  })
})

describe('mARKETING_HOME', () => {
  it('未登录根路径应落到官网', () => {
    expect(MARKETING_HOME).toBe('/marketing')
  })
})
