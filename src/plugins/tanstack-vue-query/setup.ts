import type { App } from 'vue'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    },
  },
})

export function setupTanstackVueQuery(app: App) {
  app.use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
    queryClient,
  })
}
