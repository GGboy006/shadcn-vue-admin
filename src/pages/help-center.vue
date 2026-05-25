<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ISocialMediaAccount {
  title: string
  desc: string
  url: string
}

const socialMediaAccounts = ref<ISocialMediaAccount[]>([
  { title: 'GitHub', desc: 'Shadcn UI 的源代码在 GitHub 上公开可用。', url: 'https://github.com/Whbbit1999/shadcn-vue-admin' },
  { title: 'Discord', desc: '加入我们的 Discord 服务器，提问、分享您的项目并参与社区互动。', url: '' },
  { title: 'Bilibili', desc: '在哔哩哔哩上找到我们', url: 'https://space.bilibili.com/104376935' },
])
</script>

<template>
  <BasicPage
    title="帮助中心"
    description="帮助中心描述"
  >
    <Alert>
      <AlertTitle>注意！</AlertTitle>
      <AlertDescription>
        您可以在我们的帮助中心找到问题的答案。
      </AlertDescription>
    </Alert>

    <ul class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="account in socialMediaAccounts" :key="account.title">
        <a :href="account.url || '#'" target="_blank" rel="noopener noreferrer" class="block p-4 border rounded-lg shadow-sm bg-background border-border">
          <h2 class="mb-2 text-lg font-bold">
            {{ account.title }}
          </h2>
          <p class="text-sm text-stone-500">
            {{ account.desc }}
          </p>
        </a>
      </li>
    </ul>
  </BasicPage>
</template>
