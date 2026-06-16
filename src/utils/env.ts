import { h } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { EnvSchema } from '@/validators/env.validator'

/**
 * 加载 .env 文件并根据架构进行验证
 * 如果存在此文件，它将被 vite 自动加载，我们将可以使用类型化的环境变量
 * 如果 EnvSchema 对象中有键但在 .env 文件中没有，该页面将出现错误
 */

const { data: env, error } = EnvSchema.safeParse(import.meta.env)

if (error) {
  console.error('❌ Invalid env')
  const flattenError = z.flattenError(error)
  console.error(flattenError)

  setTimeout(() => {
    toast.error(`Env error: you should check your .env file`, {
      description: h(
        'pre',
        { class: 'mt-2 rounded-md bg-slate-950 p-4 text-wrap' },
        h('code', { class: 'text-white' }, JSON.stringify(flattenError, null, 2)),
      ),
      duration: 10000,
    })
  }, 1000)
}

export default env!
